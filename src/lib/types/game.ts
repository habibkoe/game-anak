export type GameWord = {
  id: string;
  text: string;
  imageSrc: string;
  groupId: string;
  order: number;
};

export type Category = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  createdAt: Date;
};

export type Group = {
  id: string;
  name: string;
  categoryId: string;
  description?: string;
  finalRewardText: string;
  finalRewardImage?: string;
  createdAt: Date;
};

export type GameSession = {
  groupId: string;
  currentWordIndex: number;
  score: number;
  startedAt: Date;
};
