"use client";

import { useState, useEffect } from "react";
import { GameInfoResponse } from "@/lib/types";

const BOOKMARKS_KEY = "game_encyclopedia_bookmarks";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<GameInfoResponse[]>([]);

  // Load bookmarks on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BOOKMARKS_KEY);
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load bookmarks:", error);
    }
  }, []);

  const addBookmark = (game: GameInfoResponse) => {
    setBookmarks((prev) => {
      // Prevent duplicates
      if (prev.some((b) => b.title === game.title)) {
        return prev;
      }
      const updated = [...prev, game];
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const removeBookmark = (title: string) => {
    setBookmarks((prev) => {
      const updated = prev.filter((b) => b.title !== title);
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isBookmarked = (title: string) => {
    return bookmarks.some((b) => b.title === title);
  };

  return { bookmarks, addBookmark, removeBookmark, isBookmarked };
}
