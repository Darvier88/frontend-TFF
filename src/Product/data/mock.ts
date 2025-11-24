import type { PostItem } from "../../types";

export const MOCK_POSTS: PostItem[] = [
  {
    id: "p1",
    user: "@Allison_Lauren",
    username: "Allison",
    date: "2024-11-14",
    text: "Miami Heat sucks!! they don’t know how to fucking grab a ball...",
    risk: "mid",
    tags: ["offensive"],
    type: "reply",
    motive:
      "Aggressive statement that insults a group. Potentially offensive language.",
  },
  {
    id: "p2",
    user: "@Allison_Lauren",
    username: "Allison",
    date: "2016-11-01",
    text:
      "Repost of @Freedom_fighter12: I hate this government, we should do something radical...",
    risk: "high",
    tags: ["political"],
    type: "repost",
    referencedUser: "@Freedom_fighter12",
    motive:
      "Aggressive political statement suggesting radical action.",
  },
  {
    id: "p3",
    user: "@Allison_Lauren",
    username: "Allison",
    date: "2024-11-14",
    text: "If you know, you know (pineapple on pizza).",
    risk: "mid",
    tags: ["controversial"],
    type: "original",
    motive: "Lightly controversial food opinion.",
  },
  {
    id: "p4",
    user: "@Allison_Lauren",
    username: "Allison",
    date: "2024-11-14",
    text: "I love my kitty!",
    risk: "none",
    tags: [],
    type: "original",
    motive: "Benign content. No risk.",
  },
];
