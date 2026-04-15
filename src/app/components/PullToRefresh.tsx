import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

function getScrollParent(el: HTMLElement | null): HTMLElement | null {
  while (el) {
    const style = getComputedStyle(el);
    if (/(auto|scroll)/.test(style.overflow + style.overflowY)) return el;
    el = el.parentElement;
  }
  return null;
}

export function PullToRefresh({ children, onRefresh, className = "" }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollParentRef = useRef<HTMLElement | null>(null);

  const THRESHOLD = 70;
  const MAX_PULL = 120;

  useEffect(() => {
    if (containerRef.current) {
      scrollParentRef.current = getScrollParent(containerRef.current);
    }
  }, []);

  const isAtTop = useCallback(() => {
    const sp = scrollParentRef.current;
    if (sp) return sp.scrollTop <= 0;
    return window.scrollY <= 0;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isAtTop() && !isRefreshing) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }, [isRefreshing, isAtTop]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling.current || isRefreshing) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0 && isAtTop()) {
      const dampened = Math.min(diff * 0.45, MAX_PULL);
      setPullDistance(dampened);
    } else if (diff <= 0) {
      pulling.current = false;
      setPullDistance(0);
    }
  }, [isRefreshing, isAtTop]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;

    if (pullDistance >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(50);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, isRefreshing, onRefresh]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  const rotation = pullDistance * 3;

  return (
    <div
      ref={containerRef}
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden"
        style={{
          height: pullDistance > 0 ? `${pullDistance}px` : "0px",
          transition: pulling.current ? "none" : "height 0.3s ease-out",
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
          <span
            className="text-xs text-muted-foreground"
            style={{ opacity: progress }}
          >
            {isRefreshing ? "刷新中..." : pullDistance >= THRESHOLD ? "松开刷新" : "下拉刷新"}
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}
