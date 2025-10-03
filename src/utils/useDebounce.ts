import { useEffect, useState } from "react";

// The useDebounce hook delays updating the returned value until after a specified time (delay) has passed since the last change to value.
// When value changes, it waits for delay milliseconds.
// If value changes again before the delay is over, the timer resets.
// Only after delay ms of no changes, the returned value (v) updates.

export function useDebounce<T>(value: T, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return v;
}
