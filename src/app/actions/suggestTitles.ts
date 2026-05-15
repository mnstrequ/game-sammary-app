"use server";

import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.OPENAI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: apiKey,
});

export async function suggestTitles(query: string): Promise<string[]> {
  if (!apiKey) {
    throw new Error("API Key is not configured.");
  }
  
  if (!query || query.length < 2) {
    return [];
  }

  const prompt = `
ユーザーが入力した文字列「${query}」から始まる、または部分一致する、実在する有名なビデオゲームのタイトルを最大5つリストアップしてください。
ゲーム以外のものは絶対に含めないでください。

出力フォーマットは必ず以下のJSON配列のみとし、それ以外の説明は一切含めないでください。
[
  "ゲームタイトル1",
  "ゲームタイトル2",
  "ゲームタイトル3"
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
    if (!content) return [];

    const data: string[] = JSON.parse(content);
    return data;
  } catch (error) {
    console.error("Suggest API error:", error);
    return [];
  }
}
