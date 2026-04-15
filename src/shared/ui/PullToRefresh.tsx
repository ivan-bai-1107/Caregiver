import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

function getScrollParent(element: HTMLElement | null): HTMLElement | null {
  let current = element;

  while (current) {
    const style = getComputedStyle(current);

    if (/(auto|scroll)/.test(style.overflow + style.overflowY)) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
}

export function PullToRefresh({
  children,
  onRefresh,
  className = "",
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const isPulling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollParentRef = useRef<HTMLElement | null>(null);

  const threshold = 70;
  const maxPull = 120;

  useEffect(() => {
    if (containerRef.current) {
      scrollParentRef.current = getScrollParent(containerRef.current);
    }
  }, []);

  const isAtTop = useCallback(() => {
    const scrollParent = scrollParentRef.current;

    if (scrollParent) {
      return scrollParent.scrollTop <= 0;
    }

    return window.scrollY <= 0;
  }, []);

  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (isAtTop() && !isRefreshing) {
        startY.current = event.touches[0].clientY;
        isPulling.current = true;
      }
    },
    [isAtTop, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (!isPulling.current || isRefreshing) {
        return;
      }

      const distance = event.touches[0].clientY - startY.current;

      if (distance > 0 && isAtTop()) {
        setPullDistance(Math.min(distance * 0.45, maxPull));
        return;
      }

      isPulling.current = false;
      setPullDistance(0);
    },
    [isAtTop, isRefreshing]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) {
      return;
    }

    isPulling.current = false;

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(50);

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }

      return;
    }

    setPullDistance(0);
  }, [isRefreshing, onRefresh, pullDistance]);

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = pullDistance * 3;

  return (
    <div
      ref={containerRef}
      className={className}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
    >
      <div
        className="flex items-center justify-center overflow-hidden"
        style={{
          height: pullDistance > 0 ? `${pullDistance}px` : "0px",
          transition: isPulling.current ? "none" : "height 0.3s ease-out",
        }}
      >
        <div className="flex flex-col items-center gap-1.5">
          <RefreshCw
            className={`w-5 h-5 text-primary ${isRefreshing ? "animate-spin" : ""}`}
            style={{
              opacity: progress,
              transform: isRefreshing ? undefined : `rotate(${rotation}deg)`,
            }}
          />
          <span className="text-xs text-muted-foreground" style={{ opacity: progress }}>
            {isRefreshing ? "刷新中..." : pullDistance >= threshold ? "松开刷新" : "下拉刷新"}
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}
