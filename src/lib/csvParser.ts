import { PlayStatus, SavedGame } from "./types";

export function parseCSV(csvText: string): Partial<SavedGame>[] {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Expecting: Title,Platforms,Status
  // Status must map to PlayStatus or default to "未プレイ"
  
  const results: Partial<SavedGame>[] = [];
  
  // Skip header, parse rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Simple CSV parser ignoring quotes for now, assuming simple format: title, platform1;platform2, status
    const parts = line.split(",").map(s => s.trim());
    if (parts.length >= 1 && parts[0]) {
      const title = parts[0];
      const platformsStr = parts.length >= 2 ? parts[1] : "";
      const statusStr = parts.length >= 3 ? parts[2] : "未プレイ";
      
      const platforms = platformsStr ? platformsStr.split(";").map(p => p.trim()) : [];
      let status: PlayStatus = "未プレイ";
      
      if (["未プレイ", "プレイ中", "クリア済", "途中リタイア"].includes(statusStr)) {
        status = statusStr as PlayStatus;
      }

      results.push({
        id: title, // Using title as ID for simplicity
        title,
        platforms,
        status,
        addedAt: new Date().toISOString()
      });
    }
  }

  return results;
}
