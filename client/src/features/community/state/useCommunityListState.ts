import { useEffect, useState } from "react";
import type { CommunityPost } from "@/features/community/model";
import { listCommunityPosts } from "@/features/community/services/community.service";

export function useCommunityListState() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadPosts() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listCommunityPosts({
        q: searchQuery.trim() || undefined,
        tag: activeTag || undefined,
        page: 1,
        pageSize: 20,
      });
      setPosts(response.items ?? []);
      setTotal(Number(response.total ?? 0));
    } catch {
      setError("社区内容加载失败，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPosts();
  }, [activeTag, searchQuery]);

  return {
    posts,
    searchQuery,
    activeTag,
    total,
    isLoading,
    error,
    setSearchQuery,
    setActiveTag,
    retry: loadPosts,
  };
}
