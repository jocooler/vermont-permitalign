import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { dbPermitToLocal } from "./PERMIT_DATA";

let _cache = null;

export function usePermits() {
  const [permits, setPermits] = useState(_cache || []);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    if (_cache) return;
    base44.entities.PermitType.filter({ is_active: true }, "phase").then(records => {
      const mapped = records.map(dbPermitToLocal);
      _cache = mapped;
      setPermits(mapped);
      setLoading(false);
    });
  }, []);

  return { permits, loading };
}