import { useMemo, useState } from "react";
import type { ContentTag, PostType, RiskLevel, PostItem } from "../../types";
import { MOCK_POSTS } from "../data/mock";

export function usePosts() {
  const [posts, setPosts] = useState<PostItem[]>(MOCK_POSTS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [riskFilter, setRiskFilter] = useState<RiskLevel[]>([
    "high",
    "mid",
    "low",
    "none",
  ]);

  const [contentFilter, setContentFilter] = useState<ContentTag[]>([
    "controversial",
    "nsfw",
    "political",
    "offensive",
  ]);

  const [typeFilter, setTypeFilter] = useState<PostType[]>([
    "original",
    "reply",
    "quote",
    "repost",
  ]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const selectAll = (ids: string[]) => setSelectedIds(new Set(ids));
  const unselectAll = () => setSelectedIds(new Set());

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      // AND entre categorías:
      const riskOk = riskFilter.includes(p.risk);

      // Content:
      // - Si no hay tags en el post:
      //   * si no hay filtros activos en content -> pasa
      //   * si sí hay filtros activos -> no pasa (no matchea ninguno)
      // - Si hay tags -> OR entre tags vs contentFilter
      const contentOk =
        p.tags.length === 0
          ? contentFilter.length === 0
          : p.tags.some((t: ContentTag) => contentFilter.includes(t));

      const typeOk = typeFilter.includes(p.type);

      return riskOk && contentOk && typeOk;
    });
  }, [posts, riskFilter, contentFilter, typeFilter]);

  const removeSelected = () => {
    setPosts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
  };

  const stateMeta = {
    totalAnalyzed: 1576,
    analyzedAsOf: "Nov 3, 2025",
  };

  return {
    posts,
    filtered,
    selectedIds,
    toggleSelect,
    selectAll,
    unselectAll,
    removeSelected,
    // filters
    riskFilter,
    setRiskFilter,
    contentFilter,
    setContentFilter,
    typeFilter,
    setTypeFilter,
    // meta
    stateMeta,
  };
}
