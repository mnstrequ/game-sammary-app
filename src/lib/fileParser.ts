import * as xlsx from "xlsx";
import { PlayStatus, SavedGame } from "./types";

/**
 * Parses CSV or TSV text into an array of Partial<SavedGame>.
 */
export function parseCSV(text: string): Partial<SavedGame>[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Determine separator by checking the first line (header)
  const isTSV = lines[0].includes("\t");
  const separator = isTSV ? "\t" : ",";

  const results: Partial<SavedGame>[] = [];
  
  // Skip header, parse rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(separator).map(s => s.trim());
    
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

/**
 * Parses an Excel file (ArrayBuffer) into an array of Partial<SavedGame>.
 */
export function parseExcel(buffer: ArrayBuffer): Partial<SavedGame>[] {
  const workbook = xlsx.read(buffer, { type: "array" });
  if (workbook.SheetNames.length === 0) return [];
  
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Convert sheet to array of arrays
  const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
  
  if (rawData.length < 2) return [];

  const results: Partial<SavedGame>[] = [];

  // Skip header, parse rows
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (row && row.length >= 1 && row[0]) {
      const title = String(row[0]).trim();
      const platformsStr = row.length >= 2 && row[1] ? String(row[1]).trim() : "";
      const statusStr = row.length >= 3 && row[2] ? String(row[2]).trim() : "未プレイ";

      const platforms = platformsStr ? platformsStr.split(";").map(p => p.trim()) : [];
      let status: PlayStatus = "未プレイ";
      
      if (["未プレイ", "プレイ中", "クリア済", "途中リタイア"].includes(statusStr)) {
        status = statusStr as PlayStatus;
      }

      results.push({
        id: title,
        title,
        platforms,
        status,
        addedAt: new Date().toISOString()
      });
    }
  }

  return results;
}
