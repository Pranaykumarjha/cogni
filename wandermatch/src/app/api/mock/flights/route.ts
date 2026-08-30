import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const origin = (searchParams.get("origin") || "JFK").toUpperCase();
  const destination = (searchParams.get("destination") || "Paris").toUpperCase();
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const apiKey = process.env.RAPIDAPI_KEY;

  // ── Real Sky Scrapper (Skyscanner) API ────────────────────────────────────────
  if (apiKey) {
    try {
      // Step 1: Get airport entity IDs for origin and destination
      const [origRes, destRes] = await Promise.all([
        fetch(
          `https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport?query=${origin}&locale=en-US`,
          {
            headers: {
              "X-RapidAPI-Key": apiKey,
              "X-RapidAPI-Host": "sky-scrapper.p.rapidapi.com",
            },
          }
        ),
        fetch(
          `https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport?query=${destination}&locale=en-US`,
          {
            headers: {
              "X-RapidAPI-Key": apiKey,
              "X-RapidAPI-Host": "sky-scrapper.p.rapidapi.com",
            },
          }
        ),
      ]);

      const origData = await origRes.json();
      const destData = await destRes.json();

      const origEntityId = origData?.data?.[0]?.entityId;
      const destEntityId = destData?.data?.[0]?.entityId;

      if (!origEntityId || !destEntityId) {
        throw new Error("Could not resolve airport entity IDs");
      }

      // Step 2: Search one-way flights
      const [year, month, day] = date.split("-");
      const flightRes = await fetch(
        `https://sky-scrapper.p.rapidapi.com/api/v2/flights/searchFlightsComplete?originSkyId=${origin}&destinationSkyId=${destination}&originEntityId=${origEntityId}&destinationEntityId=${destEntityId}&date=${year}-${month}-${day}&adults=1&currency=USD&market=en-US&countryCode=US`,
        {
          headers: {
            "X-RapidAPI-Key": apiKey,
            "X-RapidAPI-Host": "sky-scrapper.p.rapidapi.com",
          },
        }
      );

      const flightData = await flightRes.json();
      const itineraries = flightData?.data?.itineraries || [];

      // Map to our internal format
      const flights = itineraries.slice(0, 6).map((it: any, idx: number) => {
        const leg = it.legs?.[0];
        const carrier = leg?.carriers?.marketing?.[0];
        return {
          id: it.id || `fl-${idx}`,
          airline: carrier?.name || "Unknown Airline",
          flightNumber: `${carrier?.alternateId || "XX"}${Math.floor(Math.random() * 9000) + 1000}`,
          origin: leg?.origin?.displayCode || origin,
          destination: leg?.destination?.displayCode || destination,
          departureTime: leg?.departure?.split("T")[1]?.slice(0, 5) || "--:--",
          arrivalTime: leg?.arrival?.split("T")[1]?.slice(0, 5) || "--:--",
          duration: `${Math.floor((leg?.durationInMinutes || 0) / 60)}h ${(leg?.durationInMinutes || 0) % 60}m`,
          price: it.price?.raw || 0,
          isDirect: (leg?.stopCount || 0) === 0,
          deepLink: `https://www.skyscanner.net`,
        };
      });

      return NextResponse.json({ flights, source: "skyscanner" });
    } catch (err) {
      console.error("Sky Scrapper API error, falling back to mock:", err);
      // Fall through to mock below
    }
  }

  // ── Mock Fallback ─────────────────────────────────────────────────────────────
  const airlines = ["Delta", "Air France", "United", "Lufthansa", "British Airways"];
  const numFlights = Math.floor(Math.random() * 3) + 3;
  const flights = [];

  for (let i = 0; i < numFlights; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const price = Math.floor(Math.random() * 800) + 300;
    const depHour = Math.floor(Math.random() * 16) + 6;
    const depMinute = Math.random() > 0.5 ? "00" : "30";
    const duration = Math.floor(Math.random() * 8) + 4;
    const arrHour = (depHour + duration) % 24;

    flights.push({
      id: `fl-${Math.random().toString(36).substring(7)}`,
      airline,
      flightNumber: `${airline.substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 9000) + 1000}`,
      origin,
      destination,
      departureTime: `${depHour.toString().padStart(2, "0")}:${depMinute}`,
      arrivalTime: `${arrHour.toString().padStart(2, "0")}:${depMinute}`,
      duration: `${duration}h 00m`,
      price,
      isDirect: Math.random() > 0.3,
      deepLink: null,
    });
  }

  flights.sort((a, b) => a.price - b.price);
  return NextResponse.json({ flights, source: "mock" });
}
