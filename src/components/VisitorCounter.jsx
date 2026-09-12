import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const KEY = "sidownload_visitor_id";

function getVisitorId() {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export default function VisitorCounter() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    let alive = true;
    let channel;

    const load = async () => {
      const { data, error } = await supabase.rpc("get_visitor_count");
      if (error) return console.error("Supabase visitor count:", error);
      if (alive) setCount(Number(data || 0));
    };

    const init = async () => {
      const { error } = await supabase.from("visitors").insert({ visitor_id: getVisitorId() });
      if (error && error.code !== "23505") console.error("Supabase visitor insert:", error);
      await load();

      channel = supabase.channel(`visitors-${Date.now()}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "visitors" }, load)
        .subscribe();
    };

    init().catch(console.error);
    return () => {
      alive = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="visitor-counter">
      <span className="visitor-icon">👁</span>
      <span className="visitor-number">{count === null ? "..." : new Intl.NumberFormat("id-ID").format(count)}</span>
      <span className="visitor-label">Pengunjung</span>
    </div>
  );
}
