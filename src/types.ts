export type RiskLevel = "high" | "mid" | "low" | "none";
export type ContentTag = "controversial" | "nsfw" | "political" | "offensive";
export type PostType = "original" | "reply" | "quote" | "repost";

export interface PostItem {
  id: string;
  user: string;
  username: string;
  date: string;
  text: string;
  risk: RiskLevel;
  tags: ContentTag[];
  type: PostType;
  motive?: string;
  referencedUser?: string;
}
