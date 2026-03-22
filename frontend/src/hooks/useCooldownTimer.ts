import { useState, useEffect, useRef } from "react";
import { formatCountdown } from "@/lib/utils";

export function useCooldownTimer(onChainSeconds: bigint): {
  display: string;
  expired: boolean;
} {
  const [remaining, setRemaining] = useState<number>(Number(onChainSeconds));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRemaining(Number(onChainSeconds));
  }, [onChainSeconds]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (remaining <= 0) return;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [remaining > 0]);

  return {
    display: remaining > 0 ? formatCountdown(remaining) : "",
    expired: remaining <= 0,
  };
}
