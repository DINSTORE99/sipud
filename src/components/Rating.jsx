import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Rating() {
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadReviews = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("id, name, rating, comment, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load reviews:", error);
      return;
    }

    setReviews(data || []);
  };

  useEffect(() => {
    loadReviews();

    const channel = supabase
      .channel("sidownload-reviews")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reviews",
        },
        (payload) => {
          setReviews((current) => {
            const exists = current.some(
              (item) => item.id === payload.new.id
            );

            if (exists) return current;

            return [payload.new, ...current];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const submitReview = async (e) => {
    e.preventDefault();

    setMessage("");

    const cleanName = name.trim();
    const cleanComment = comment.trim();

    if (!cleanName) {
      setMessage("Nama wajib diisi.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setMessage("Silakan pilih rating 1–5 bintang.");
      return;
    }

    if (!cleanComment) {
      setMessage("Komentar wajib diisi.");
      return;
    }

    if (cleanName.length > 50) {
      setMessage("Nama maksimal 50 karakter.");
      return;
    }

    if (cleanComment.length > 500) {
      setMessage("Komentar maksimal 500 karakter.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        name: cleanName,
        rating,
        comment: cleanComment,
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      console.error("Submit review:", error);
      setMessage("Gagal mengirim review. Coba lagi.");
      return;
    }

    // Tambahkan langsung ke tampilan.
    // Realtime juga aktif sebagai backup.
    if (data) {
      setReviews((current) => {
        const exists = current.some(
          (item) => item.id === data.id
        );

        return exists ? current : [data, ...current];
      });
    }

    setName("");
    setComment("");
    setRating(0);
    setMessage("Review berhasil dikirim! ⭐");
  };

  const total = reviews.length;

  const average =
    total > 0
      ? reviews.reduce((sum, item) => sum + item.rating, 0) /
        total
      : 0;

  const formattedAverage = average.toFixed(1);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <section className="rating-section" id="rating">
      <div className="rating-container">

        {/* HEADER */}
        <div className="rating-header">
          <span className="rating-badge">
            ⭐ REVIEW
          </span>

          <h2>
            Rating & Komentar
          </h2>

          <p>
            Bagikan pengalaman kamu menggunakan SIDOWNLOAD.
          </p>
        </div>

        {/* STATISTIK */}
        <div className="rating-stats">

          <div className="rating-score">
            <strong>{formattedAverage}</strong>

            <div className="rating-stars-small">
              {"★★★★★"}
            </div>

            <span>
              dari 5 bintang
            </span>
          </div>

          <div className="rating-total">
            <strong>{total}</strong>

            <span>
              Total Review
            </span>
          </div>

        </div>

        {/* FORM */}
        <form
          className="rating-form"
          onSubmit={submitReview}
        >

          <div className="form-title">
            Berikan Rating
          </div>

          <div className="star-picker">

            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                className={
                  star <= (hover || rating)
                    ? "star active"
                    : "star"
                }
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                aria-label={`${star} bintang`}
              >
                ★
              </button>
            ))}

          </div>

          <input
            type="text"
            placeholder="Nama kamu"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
          />

          <textarea
            placeholder="Tulis komentar kamu..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            rows={5}
          />

          <div className="comment-length">
            {comment.length}/500
          </div>

          {message && (
            <div className="rating-message">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="submit-rating"
            disabled={loading}
          >
            {loading
              ? "Mengirim..."
              : "Kirim Rating ⭐"}
          </button>

        </form>

        {/* REVIEW LIST */}
        <div className="reviews-wrapper">

          <div className="reviews-title">
            Komentar Pengguna
            <span>{total}</span>
          </div>

          {reviews.length === 0 ? (
            <div className="no-reviews">
              Belum ada komentar.
              <br />
              Jadilah yang pertama memberikan rating! ⭐
            </div>
          ) : (
            <div className="reviews-list">

              {reviews.map((review) => (
                <article
                  className="review-card"
                  key={review.id}
                >

                  <div className="review-top">

                    <div className="review-avatar">
                      {review.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="review-user">
                      <strong>
                        {review.name}
                      </strong>

                      <span>
                        {formatDate(review.created_at)}
                      </span>
                    </div>

                    <div className="review-stars">
                      {"★".repeat(review.rating)}
                      <span>
                        {"★".repeat(5 - review.rating)}
                      </span>
                    </div>

                  </div>

                  <p className="review-comment">
                    {review.comment}
                  </p>

                </article>
              ))}

            </div>
          )}

        </div>

      </div>
    </section>
  );
}
