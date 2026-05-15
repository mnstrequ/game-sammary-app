"use client";

import { useState, useEffect } from "react";
import { GameInfoResponse, PlayStatus, SavedGame } from "@/lib/types";

const BOOKMARKS_KEY = "game_encyclopedia_bookmarks";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<SavedGame[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(BOOKMARKS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Migration: If data is old (GameInfoResponse directly), convert to SavedGame
        const migrated: SavedGame[] = parsed.map((item: any) => {
          if (item.title && item.status === undefined) {
            // It's an old GameInfoResponse
            return {
              id: item.title,
              title: item.title,
              status: "未プレイ" as PlayStatus,
              platforms: item.platforms || [],
              info: item,
              addedAt: new Date().toISOString()
            };
          }
          return item;
        });

        setBookmarks(migrated);
        
        // Save migrated if different
        if (JSON.stringify(parsed) !== JSON.stringify(migrated)) {
          localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(migrated));
        }
      }
    } catch (error) {
      console.error("Failed to load bookmarks:", error);
    }
  }, []);

  const addBookmark = (game: GameInfoResponse) => {
    setBookmarks((prev) => {
      if (prev.some((b) => b.id === game.title)) return prev;
      
      const newGame: SavedGame = {
        id: game.title,
        title: game.title,
        status: "未プレイ",
        platforms: game.platforms || [],
        info: game,
        addedAt: new Date().toISOString(),
      };
      const updated = [...prev, newGame];
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const removeBookmark = (id: string) => {
    setBookmarks((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const updateStatus = (id: string, status: PlayStatus) => {
    setBookmarks((prev) => {
      const updated = prev.map((b) => b.id === id ? { ...b, status } : b);
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const updateInfo = (id: string, info: GameInfoResponse) => {
    setBookmarks((prev) => {
      const updated = prev.map((b) => b.id === id ? { ...b, info, platforms: info.platforms || b.platforms } : b);
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const bulkImport = (games: Partial<SavedGame>[]) => {
    setBookmarks((prev) => {
      const newGames = [...prev];
      let changed = false;

      games.forEach(g => {
        if (g.title && !newGames.some(existing => existing.id === g.id)) {
          newGames.push(g as SavedGame);
          changed = true;
        }
      });

      if (changed) {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newGames));
        return newGames;
      }
      return prev;
    });
  };

  const isBookmarked = (title: string) => {
    return bookmarks.some((b) => b.id === title);
  };

  const getBookmark = (title: string) => {
    return bookmarks.find((b) => b.id === title);
  };

  return { bookmarks, addBookmark, removeBookmark, isBookmarked, getBookmark, updateStatus, updateInfo, bulkImport };
}

