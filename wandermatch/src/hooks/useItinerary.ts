"use client";

import { useState, useEffect } from "react";
import { useSocket } from "./useSocket";

export interface ItineraryItem {
  _id: string;
  day: number;
  title: string;
  description?: string;
  category: "activity" | "food" | "transport" | "accommodation" | "other";
  lat?: number;
  lng?: number;
  location?: string;
  startTime?: string;
  endTime?: string;
  order: number;
}

export function useItinerary(tripId: string, initialItems: ItineraryItem[] = []) {
  const { socket } = useSocket();
  const [items, setItems] = useState<ItineraryItem[]>(initialItems);

  useEffect(() => {
    if (!socket || !tripId) return;

    socket.emit("join-trip", tripId);

    const handleUpdate = (data: any) => {
      if (data.action === "add") {
        setItems((prev) => [...prev, data.item]);
      } else if (data.action === "set") {
        setItems(data.items);
      } else if (data.action === "update") {
        setItems((prev) =>
          prev.map((item) => (item._id === data.item._id ? data.item : item))
        );
      } else if (data.action === "delete") {
        setItems((prev) => prev.filter((item) => item._id !== data.itemId));
      }
    };

    socket.on("itinerary-updated", handleUpdate);

    return () => {
      socket.off("itinerary-updated", handleUpdate);
      socket.emit("leave-trip", tripId);
    };
  }, [socket, tripId]);

  const addItem = async (itemData: any) => {
    // Optimistic ID (will be replaced by real DB ID)
    const tempId = Math.random().toString(36).substring(7);
    const tempItem = { _id: tempId, ...itemData };
    setItems((prev) => [...prev, tempItem]);

    // DB call
    const res = await fetch(`/api/trips/${tripId}/itinerary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemData),
    });
    
    if (res.ok) {
      const realItem = await res.json();
      setItems((prev) => prev.map((i) => (i._id === tempId ? realItem : i)));
      socket?.emit("itinerary-update", { tripId, action: "add", item: realItem });
    }
  };

  const deleteItem = async (itemId: string) => {
    setItems((prev) => prev.filter((i) => i._id !== itemId));
    socket?.emit("itinerary-update", { tripId, action: "delete", itemId });

    await fetch(`/api/trips/${tripId}/itinerary?itemId=${itemId}`, {
      method: "DELETE",
    });
  };

  const updateItem = async (itemId: string, updates: Partial<ItineraryItem>) => {
    // Optimistic update
    setItems((prev) => prev.map((i) => (i._id === itemId ? { ...i, ...updates } : i)));

    const res = await fetch(`/api/trips/${tripId}/itinerary?itemId=${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (res.ok) {
      const updatedItem = await res.json();
      const normalized = {
        ...updatedItem,
        _id: updatedItem._id?.toString?.() ?? updatedItem._id,
      };
      setItems((prev) => prev.map((i) => (i._id === itemId ? normalized : i)));
      socket?.emit("itinerary-update", { tripId, action: "update", item: normalized });
    }
  };

  const setItinerary = (newItems: ItineraryItem[]) => {
    setItems(newItems);
    socket?.emit("itinerary-update", { tripId, action: "set", items: newItems });
  };

  return { items, addItem, updateItem, deleteItem, setItinerary };
}
