import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const VISITOR_KEY = "sidownload_visitor_id";

function getVisitorId() {
  try {
    let visitorId =
      localStorage.getItem(VISITOR_KEY);

    if (!visitorId) {
      visitorId =
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()
              .toString(36)
              .slice(2)}`;

      localStorage.setItem(
        VISITOR_KEY,
        visitorId
      );
    }

    return visitorId;
  } catch {
    return `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;
  }
}

export default function VisitorCounter() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    let mounted = true;
    let channel = null;

    const loadCount = async () => {
      const { data, error } =
        await supabase.rpc(
          "get_visitor_count"
        );

      if (error) {
        console.error(
          "❌ Visitor count:",
          error
        );
        return;
      }

      if (mounted) {
        setCount(Number(data || 0));
      }
    };

    const registerVisitor = async () => {
      try {
        const visitorId = getVisitorId();

        const { error } =
          await supabase
            .from("visitors")
            .insert({
              visitor_id: visitorId,
            });

        /*
         * 23505 = visitor sudah pernah
         * terdaftar pada browser ini.
         */
        if (
          error &&
          error.code !== "23505"
        ) {
          console.error(
            "❌ Visitor register:",
            error
          );
        }

        await loadCount();

        channel = supabase
          .channel(
            `sidownload-visitors-${Date.now()}`
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "visitors",
            },
            () => {
              loadCount();
            }
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              console.log(
                "✅ Visitor realtime connected"
              );
            }
          });
      } catch (error) {
        console.error(
          "❌ Visitor error:",
          error
        );

        /*
         * Tetap coba ambil jumlah visitor
         * meskipun registrasi gagal.
         */
        await loadCount();
      }
    };

    registerVisitor();

    return () => {
      mounted = false;

      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const formatted =
    count === null
      ? "..."
      : new Intl.NumberFormat("id-ID").format(
          count
        );

  return (
    <div
      className="visitor-counter"
      aria-label={`Jumlah pengunjung ${formatted}`}
    >
      <span className="visitor-icon">
        👁
      </span>

      <span className="visitor-number">
        {formatted}
      </span>

      <span className="visitor-label">
        Pengunjung
      </span>
    </div>
  );
}
