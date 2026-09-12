import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const MAX_NAME = 50;
const MAX_COMMENT = 500;

export default function Rating() {
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("reviews")
      .select("id,name,rating,comment,created_at")
      .order("created_at", { ascending: false }).limit(100);
    if (error) setError("Gagal mengambil rating.");
    else setReviews(data || []);
    setLoading(false);
  };

  useEffect(() => {
    let channel;
    load();
    channel = supabase.channel(`reviews-${Date.now()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, load)
      .subscribe();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  const average = useMemo(() => reviews.length ? reviews.reduce((a, r) => a + Number(r.rating), 0) / reviews.length : 0, [reviews]);

  const submit = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    const n = name.trim(), c = comment.trim();
    if (!n || n.length > MAX_NAME) return setError(`Nama wajib diisi, maksimal ${MAX_NAME} karakter.`);
    if (!c || c.length > MAX_COMMENT) return setError(`Komentar wajib diisi, maksimal ${MAX_COMMENT} karakter.`);
    if (rating < 1 || rating > 5) return setError("Rating tidak valid.");
    setSending(true);
    const { data, error } = await supabase.from("reviews")
      .insert({ name: n, rating: Number(rating), comment: c })
      .select("id,name,rating,comment,created_at").single();
    if (error) setError(error.message || "Gagal mengirim rating.");
    else { setReviews(v => [data, ...v.filter(x => x.id !== data.id)]); setName(""); setComment(""); setRating(5); setSuccess("Rating berhasil dikirim ❤️"); }
    setSending(false);
  };

  return (
    <section className="rating-section" id="rating">
      <div className="section-header"><span className="section-label">RATING</span><h3 className="section-title">Apa Kata Pengguna?</h3></div>
      <div className="rating-summary"><strong>{average.toFixed(1)}</strong><span>★★★★★</span><small>{reviews.length} ulasan</small></div>
      <form className="rating-form" onSubmit={submit}>
        <input value={name} onChange={e => setName(e.target.value)} maxLength={MAX_NAME} placeholder="Nama kamu" />
        <div className="rating-stars">{[1,2,3,4,5].map(n => <button type="button" key={n} onClick={() => setRating(n)} className={n <= rating ? "active" : ""}>★</button>)}</div>
        <textarea value={comment} onChange={e => setComment(e.target.value)} maxLength={MAX_COMMENT} placeholder="Tulis pengalaman kamu..." rows="4" />
        <button className="submit-btn" disabled={sending}>{sending ? "Mengirim..." : "Kirim Rating"}</button>
        {error && <div className="msg-error">❌ {error}</div>}
        {success && <div className="rating-success">✅ {success}</div>}
      </form>
      <div className="reviews-list">{loading ? <p>Memuat ulasan...</p> : reviews.map(r => <article className="review-card" key={r.id}><div><strong>{r.name}</strong><span>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</span></div><p>{r.comment}</p></article>)}</div>
    </section>
  );
}
