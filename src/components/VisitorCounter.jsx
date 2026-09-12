import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const VISITOR_KEY = "sidownload_visitor_id";

function getVisitorId() {
  let id = localStorage.getItem(VISITOR_KEY);

  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    localStorage.setItem(VISITOR_KEY, id);
  }

  return id;
}

export default function VisitorCounter() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    let channel;

    async function registerVisitor() {
      try {
        const visitorId = getVisitorId();

        // Daftarkan visitor.
        // Karena visitor_id UNIQUE, browser yang sama
        // tidak dihitung sebagai visitor baru setiap refresh.
        const { error: insertError } = await supabase
          .from("visitors")
          .insert({
            visitor_id: visitorId,
          });

        // 23505 = duplicate key.
        // Artinya visitor sudah pernah terdaftar, jadi aman.
        if (insertError && insertError.code !== "23505") {
          console.error("Visitor registration error:", insertError);
        }

        await loadCount();

        // Realtime: kalau ada visitor baru,
        // angka langsung diperbarui tanpa refresh.
        channel = supabase
          .channel("sidownload-visitors")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "visitors",
            },
            () => {
              loadCount();
            }
          )
          .subscribe();
      } catch (error) {
        console.error("Visitor counter error:", error);
      }
    }

    async function loadCount() {
      const { data, error } = await supabase.rpc(
        "get_visitor_count"
      );

      if (error) {
        console.error("Visitor count error:", error);
        return;
      }

      setCount(Number(data || 0));
    }

    registerVisitor();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const formattedCount =
    count === null
      ? "..."
      : new Intl.NumberFormat("id-ID").format(count);

  return (
    <div className="visitor-counter">
      <span className="visitor-icon">👁</span>

      <span className="visitor-number">
        {formattedCount}
      </span>

      <span className="visitor-label">
        Pengunjung
      </span>
    </div>
  );
}
