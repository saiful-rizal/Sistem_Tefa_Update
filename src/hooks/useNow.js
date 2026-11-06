import { useState, useEffect } from "react";

// Jam yang berdetak tiap detik, hanya jalan bila active = true.
export default function useNow(active = true) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  return now;
}
