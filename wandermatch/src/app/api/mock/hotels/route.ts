import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const destination = searchParams.get("destination") || "Paris";
  const checkIn = searchParams.get("checkIn") || new Date().toISOString().split("T")[0];
  const checkOut = searchParams.get("checkOut") || new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0];
  const apiKey = process.env.RAPIDAPI_KEY;

  // ── Real Sky Scrapper (Skyscanner) API ────────────────────────────────────────
  if (apiKey) {
    try {
      // Step 1: Search hotel location
      const locationRes = await fetch(
        `https://sky-scrapper.p.rapidapi.com/api/v1/hotels/searchDestination?query=${encodeURIComponent(destination)}`,
        {
          headers: {
            "X-RapidAPI-Key": apiKey,
            "X-RapidAPI-Host": "sky-scrapper.p.rapidapi.com",
          },
        }
      );
      const locationData = await locationRes.json();
      const entityId = locationData?.data?.[0]?.entityId;

      if (!entityId) throw new Error("Could not resolve destination entity ID");

      // Step 2: Search hotels
      const hotelRes = await fetch(
        `https://sky-scrapper.p.rapidapi.com/api/v1/hotels/searchHotels?entityId=${entityId}&checkin=${checkIn}&checkout=${checkOut}&adults=1&rooms=1&limit=6&currency=USD&market=en-US&countryCode=US`,
        {
          headers: {
            "X-RapidAPI-Key": apiKey,
            "X-RapidAPI-Host": "sky-scrapper.p.rapidapi.com",
          },
        }
      );
      const hotelData = await hotelRes.json();
      const results = hotelData?.data?.results || [];

      const hotels = results.slice(0, 6).map((h: any, idx: number) => ({
        id: h.hotelId || `ht-${idx}`,
        name: h.name || "Hotel",
        location: destination,
        rating: h.stars || 4,
        reviews: h.reviewsCount || 0,
        reviewScore: h.reviewScore || 0,
        pricePerNight: h.price?.lead?.amount || 0,
        imageUrl: h.heroImage || `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80`,
        amenities: h.amenities?.slice(0, 3) || ["Free WiFi"],
        deepLink: `https://www.skyscanner.net`,
      }));

      return NextResponse.json({ hotels, source: "skyscanner" });
    } catch (err) {
      console.error("Sky Scrapper Hotel API error, falling back to mock:", err);
      // Fall through to mock below
    }
  }

  // ── Mock Fallback ─────────────────────────────────────────────────────────────
  const hotelBrands = ["Marriott", "Hilton", "Hyatt", "Boutique", "Grand"];
  const suffixes = ["Hotel", "Resort", "Plaza", "Inn", "Suites"];
  const numHotels = Math.floor(Math.random() * 3) + 3;
  const hotels = [];

  for (let i = 0; i < numHotels; i++) {
    const brand = hotelBrands[Math.floor(Math.random() * hotelBrands.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const name = `${brand} ${destination} ${suffix}`;
    const pricePerNight = Math.floor(Math.random() * 400) + 80;
    const rating = Number((Math.random() * 2 + 3).toFixed(1));
    const reviews = Math.floor(Math.random() * 2000) + 50;

    hotels.push({
      id: `ht-${Math.random().toString(36).substring(7)}`,
      name,
      location: destination,
      rating,
      reviews,
      reviewScore: rating,
      pricePerNight,
      amenities: ["Free WiFi", Math.random() > 0.5 ? "Pool" : "Gym", "Breakfast Included"],
      imageUrl: `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80`,
      deepLink: null,
    });
  }

  hotels.sort((a, b) => b.rating - a.rating);
  return NextResponse.json({ hotels, source: "mock" });
}
