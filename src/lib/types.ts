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
