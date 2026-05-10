"use server";

import { GoogleGenAI } from "@google/genai";
import { GameInfoResponse } from "@/lib/types";

// Using OPENAI_API_KEY as requested by user, but mapping it to Gemini API
const apiKey = process.env.OPENAI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: apiKey,
});

export async function generateGameInfo(title: string): Promise<GameInfoResponse> {
  if (!apiKey) {
    throw new Error("API Key is not configured.");
  }

  const prompt = `
あなたは優秀なゲームライター・解説者です。
ユーザーから提供されたゲームタイトル「${title}」について、以下の情報を調査し、指定されたJSONスキーマに従ってJSON形式で回答してください。

{
  "title": "ゲームの正式名称",
  "genre": "ゲームのジャンル",
  "clear_time": {
    "main": "メインストーリーの想定クリア時間（例: 30時間）",
    "complete": "やり込み要素を含めた想定クリア時間（例: 80時間）",
    "dlc": "DLCがある場合の想定クリア時間（例: 10時間、ない場合は'なし'）"
  },
  "world": "世界観の解説（2〜3段落程度で詳しく）",
  "story": {
    "spoiler_free": "ネタバレなしのストーリー概要",
    "spoiler_full": "物語の結末まで含めた完全なストーリー解説"
  },
  "characters": [
    {
      "name": "キャラクター名",
      "role": "役割（主人公、ヒロイン、宿敵など）",
      "description": "キャラクターの詳細な説明"
    }
  ],
  "glossary": [
    {
      "term": "専門用語",
      "meaning": "その用語の意味や解説"
    }
  ],
  "recommend_points": [
    "おすすめポイント1",
    "おすすめポイント2",
    "おすすめポイント3"
  ]
}

注意事項:
- JSONのみを出力し、余計な説明やMarkdownのコードブロックを含めないでください。
- 「${title}」というゲームが存在しない、あるいは情報が極端に少ない場合は、その旨を推測できる範囲で埋め、分からない項目は「情報なし」としてください。
- 必ず日本語で出力してください。
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: prompt }] }
      ],
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are a helpful AI game encyclopedia assistant. Respond in JSON."
      }
    });

    const content = response.text;
    if (!content) {
      throw new Error("Failed to generate content.");
    }

    const data: GameInfoResponse = JSON.parse(content);
    return data;
  } catch (error) {
    console.error("API error:", error);
    throw new Error("Failed to generate game information.");
  }
}
