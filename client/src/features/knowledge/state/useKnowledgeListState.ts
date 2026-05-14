import { useEffect, useMemo, useState } from "react";
import type { KnowledgeArticleListItem, KnowledgeCategory } from "@/features/knowledge/model";
import { listKnowledgeArticles, listKnowledgeCategories } from "@/features/knowledge/services/knowledge.service";

export function useKnowledgeListState() {
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
  const [articles, setArticles] = useState<KnowledgeArticleListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadCategories() {
    const nextCategories = await listKnowledgeCategories();
    setCategories(nextCategories);
  }

  async function loadArticles() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listKnowledgeArticles({
        q: searchQuery.trim() || undefined,
        categoryId: activeCategoryId || undefined,
        page: 1,
        pageSize: 20,
      });
      setArticles(response.items ?? []);
      setTotal(Number(response.total ?? 0));
    } catch {
      setError("知识内容加载失败，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCategories();
  }, []);

  useEffect(() => {
    void loadArticles();
  }, [activeCategoryId, searchQuery]);

  const categoryTabs = useMemo(
    () => [{ id: "", name: "全部" }, ...categories.map((category) => ({ id: category.id, name: category.name }))],
    [categories],
  );

  return {
    categories,
    categoryTabs,
    articles,
    total,
    searchQuery,
    activeCategoryId,
    isLoading,
    error,
    setSearchQuery,
    setActiveCategoryId,
    retry: loadArticles,
  };
}
