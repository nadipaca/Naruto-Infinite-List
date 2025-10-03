import { useEffect, useRef } from "react";

// InfiniteSentinel: Utility component for infinite scrolling.
//
// - Renders an invisible <div> at the end of a list.
// - Uses the Intersection Observer API to detect when the sentinel div enters the viewport.
// - When the div becomes visible (user scrolls near the bottom), calls the onVisible callback (e.g., to load more data).
// - The disabled prop can be used to temporarily turn off the observer.
// - rootMargin: "200px" triggers the callback slightly before the sentinel is actually visible, for smoother loading.
// - Commonly used in infinite scroll UIs to automatically fetch more items as the user scrolls.
//
// Example usage:
//   <InfiniteSentinel onVisible={fetchNextPage} disabled={!hasNextPage || isFetching} />
export default function InfiniteSentinel({ onVisible, disabled }: { onVisible: () => void; disabled?: boolean; }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (disabled) return;
    const el = ref.current!;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) onVisible(); });
    }, { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, [onVisible, disabled]);
  return <div ref={ref} style={{ height: 1 }} />;
}
