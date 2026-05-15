"use server";

import { GoogleGenAI } from "@google/genai";
import { SavedGame } from "@/lib/types";

const apiKey = process.env.OPENAI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: apiKey,
});

export async function pickRandomGame(games: SavedGame[]): Promise<{ id: string, message: string } | null> {
  if (!apiKey) throw new Error("API Key is not configured.");
  if (!games || games.length === 0) return null;

  const gameData = games.map(g => ({
    id: g.id,
    title: g.title,
    genre: g.info?.genre || "不明",
    recommend: g.info?.recommend_points || []
  }));

  const prompt = `
以下の未プレイゲームリストの中から、次に遊ぶべきゲームを1つだけ選んでください。
選んだ理由を、思わずすぐにプレイしたくなるような、熱量が高くワクワクするトーン（2〜3文程度）でプレゼンしてください。

【ゲームリスト】
${JSON.stringify(gameData, null, 2)}

出力フォーマットは必ず以下のJSON形式のみとしてください。
{
  "id": "選んだゲームのid（リストに記載されているものと完全一致させること）",
  "message": "熱い推薦コメント"
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: prompt }] }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const content = response.text;
    if (!content) return null;

    const data = JSON.parse(content);
    return data;
  } catch (error) {
    console.error("AI Pick error:", error);
    return null;
  }
}

export async function sortGamesByTheme(games: SavedGame[], theme: string): Promise<string[]> {
  if (!apiKey) throw new Error("API Key is not configured.");
  if (!games || games.length === 0) return [];

  // Send minimal data to reduce tokens
  const gameData = games.map(g => ({
    id: g.id,
    title: g.title,
    desc: g.info?.recommend_points.join(" ") || g.info?.genre || ""
  }));

  const prompt = `
以下のゲームリストを、「${theme}」という基準・テーマに最も合致する順に並び替えてください。

【ゲームリスト】
${JSON.stringify(gameData, null, 2)}

出力フォーマットは必ず以下のJSON配列（IDのみのリスト）のみとしてください。
[
  "1位のゲームのid",
  "2位のゲームのid",
  "3位のゲームのid"
]
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: prompt }] }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const content = response.text;
    if (!content) return games.map(g => g.id);

    const data: string[] = JSON.parse(content);
    return data;
  } catch (error) {
    console.error("AI Sort error:", error);
    // Fallback to original order
    return games.map(g => g.id);
  }
}
