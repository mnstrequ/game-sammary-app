export type GameClearTime = {
  main: string;
  complete: string;
  dlc: string;
};

export type GameCharacter = {
  name: string;
  role: string;
  description: string;
};

export type GameGlossaryTerm = {
  term: string;
  meaning: string;
};

export type GameInfoResponse = {
  title: string;
  genre: string;
  platforms: string[];
  clear_time: GameClearTime;
  world: string;
  story: {
    spoiler_free: string;
    spoiler_full: string;
  };
  characters: GameCharacter[];
  glossary: GameGlossaryTerm[];
  recommend_points: string[];
};

export type PlayStatus = "未プレイ" | "プレイ中" | "クリア済" | "途中リタイア";

export type SavedGame = {
  id: string; // Typically the title
  title: string;
  status: PlayStatus;
  platforms: string[];
  info?: GameInfoResponse; // Can be undefined if imported via CSV
  addedAt: string; // ISO date string
};

