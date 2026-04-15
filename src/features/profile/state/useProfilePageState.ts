import { useEffect, useState } from "react";
import type { UserProfile, UserStats } from "@/features/profile/model";
import { getUserProfile, getUserStats } from "@/features/profile/services/profile.service";

export function useProfilePageState() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadProfilePage() {
    setIsLoading(true);
    setError(null);

    try {
      const [nextProfile, nextStats] = await Promise.all([getUserProfile(), getUserStats()]);
      setProfile(nextProfile);
      setStats(nextStats);
    } catch (loadError) {
      setError("个人中心加载失败，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadProfilePage();
  }, []);

  return {
    profile,
    stats,
    isLoading,
    error,
    retry: loadProfilePage,
  };
}
