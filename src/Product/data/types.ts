export type RiskLevel = "high" | "mid" | "low" | "no";

export type RiskLabel =
  | "violence"
  | "political_sensitivity"
  | "legal_privacy"
  | "toxic"
  | "nsfw"
  | "bullying"
  | "hate"
  | string;

export type PostType = "original" | "reply" | "quote" | "repost";

export interface RiskItem {
  labels: RiskLabel[];
  risk_level: RiskLevel;
  rationale: string;
  tweet_id: number;
  text: string;
  post_type?: PostType;
  is_retweet?: boolean;
}

export interface TiemposEstimacion {
  modulo?: string;
  funcion?: string;
  tiempo_real?: string;
  tiempo_segundos?: number;
  exito?: boolean;
  error?: string;
}

export interface TiemposFile {
  tiempo_estimado_total?: string;
  tiempo_estimado_segundos?: number;
  configuracion?: {
    usuario?: string;
  };
  estimaciones?: TiemposEstimacion[];
}

export interface TweetRef {
  type: string;
  id: string;
}

export interface TweetMeta {
  id: string;
  text: string;
  created_at?: string;
  is_retweet?: boolean;
  referenced_tweets?: TweetRef[];
  media?: string[];
}

export interface TweetsFileObject {
  tweets?: TweetMeta[];
  user?: {
    username?: string;
    name?: string;
  };
}

export const PAGE_SIZE = 20;

export const RT_REGEX = /^RT\s+@([^:]+):\s*([\s\S]*)$/i;
export const URL_REGEX = /https:\/\/t\.co\/\S+/g;

export const parseRetweetText = (text: string) => {
  const match = RT_REGEX.exec(text.trim());
  if (!match) return null;
  return {
    handle: match[1],
    body: match[2] || "",
  };
};

export const extractUrlsFromText = (text: string): string[] => {
  return text.match(URL_REGEX) || [];
};

export const stripUrlsFromText = (text: string): string =>
  text.replace(URL_REGEX, "").trim();

export const formatLabel = (label: string) =>
  label
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
