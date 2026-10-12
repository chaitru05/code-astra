import { useState, useEffect, useCallback, useRef } from "react";
import { checkHealth } from "../services/healthService";

/**
 * Polls backend health every 30s. Returns { status, healthData, isOnline, check }.
 */
export function useHealthStatus() {
  const [status, setStatus] = useState("checking"); // "online" | "offline" | "checking"
  const [healthData, setHealthData] = useState(null);
  const intervalRef = useRef(null);

  const check = useCallback(async () => {
    try {
      const data = await checkHealth();
      setHealthData(data);
      setStatus(data.status === "ok" ? "online" : "offline");
      return data;
    } catch {
      setStatus("offline");
      setHealthData(null);
      return null;
    }
  }, []);

  useEffect(() => {
    check();
    intervalRef.current = setInterval(check, 30000);
    return () => clearInterval(intervalRef.current);
  }, [check]);

  return { status, healthData, isOnline: status === "online", check };
}
