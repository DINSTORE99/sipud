import { useEffect, useState } from "react";
import "./style.css";

import VisitorCounter from "./components/VisitorCounter";
import Rating from "./components/Rating";

const APK_LINK = "https://sfile.mobi/LINK-APK-KAMU";

const PLATFORMS = [
  {
    id: "tiktok",
    name: "TikTok",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-1.07V9.42a6.32 6.32 0 1 0 6.34 6.32V8.87a8.16 8.16 0 0 0 4.77 1.52V6.95a4.85 4.85 0 0 1-1-.26z" />
      </svg>
    ),
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.87.24-1.46 1.5-1.46h1.6V3.96c-.28-.04-1.24-.12-2.36-.12-2.34 0-3.94 1.43-3.94 4.05V10H7.65v3h2.65v8h3.2Z" />
      </svg>
    ),
  },
  {
    id: "capcut",
    name: "CapCut",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 7h8.5a4 4 0 0 1 3.4 1.9L19 12l-2.1 3.1a4 4 0 0 1-3.4 1.9H5l4-5-4-5Z" />
      </svg>
    ),
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.12C19.55 3.5 12 3.5 12 3.5s-7.55 0-9.4.58A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.12c1.85.58 9.4.58 9.4.58s7.55 0 9.4-.58a3 3 0 0 0 2.1-2.12A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.9V8.1l6.3 3.9-6.3 3.9Z" />
      </svg>
    ),
  },
  {
    id: "spotify",
    name: "Spotify",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
        <path
          d="M7 9.5c3.3-1 7.2-.7 10 .7M7.8 12.3c2.8-.7 5.8-.5 8.2.6M8.6 15c2-.4 4.1-.2 5.9.5"
          fill="none"
          stroke="#000"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

function App() {
  const [url, setUrl] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("tiktok");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [history, setHistory] = useState([]);

  /* =========================
     LOAD HISTORY
  ========================= */

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sidownload_history");

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, 8));
        }
      }
    } catch (err) {
      console.error("History error:", err);
    }

    sendNotification("visit");
  }, []);

  /* =========================
     NOTIFICATION
  ========================= */

  const sendNotification = async (type, details = {}) => {
    try {
      await fetch("/api/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          details,
        }),
      });
    } catch {
      // Jangan sampai notification
      // mengganggu website.
    }
  };

  /* =========================
     PASTE
  ========================= */

  const handlePaste = async () => {
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard tidak tersedia");
      }

      const text = await navigator.clipboard.readText();

      if (!text) {
        setError("Clipboard kosong.");
        return;
      }

      setUrl(text.trim());
      setError("");
      setResult(null);
    } catch {
      setError(
        "Clipboard tidak dapat diakses. Silakan paste link secara manual."
      );
    }
  };

  /* =========================
     SAVE HISTORY
  ========================= */

  const saveHistory = (item) => {
    try {
      const updated = [
        item,
        ...history.filter((old) => old.url !== item.url),
      ].slice(0, 8);

      setHistory(updated);

      localStorage.setItem(
        "sidownload_history",
        JSON.stringify(updated)
      );
    } catch (err) {
      console.error("Save history error:", err);
    }
  };

  /* =========================
     CLEAR
  ========================= */

  const clearURL = () => {
    setUrl("");
    setResult(null);
    setError("");
  };

  const clearHistory = () => {
    setHistory([]);

    try {
      localStorage.removeItem("sidownload_history");
    } catch {}
  };

  /* =========================
     DOWNLOAD
  ========================= */

  const handleDownload = async (e) => {
    e.preventDefault();

    const cleanURL = url.trim();

    if (!cleanURL) {
      setError("Masukkan URL terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    await sendNotification("process", {
      url: cleanURL,
      platform: selectedPlatform,
    });

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: cleanURL,
        }),
      });

      const rawText = await response.text();

      let data;

      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          "Server mengembalikan response yang tidak valid."
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Gagal mengambil media."
        );
      }

      setResult(data);

      const downloadUrl =
        data.download ||
        data.url ||
        data.video ||
        data.audio ||
        data.downloads?.[0]?.url ||
        cleanURL;

      const historyItem = {
        url: downloadUrl,
        source_url: cleanURL,
        platform:
          data.platform ||
          selectedPlatform ||
          "Media",
        title:
          data.title ||
          "Media berhasil diproses",
        thumbnail:
          data.thumbnail ||
          null,
        created_at: Date.now(),
        date: new Date().toLocaleDateString("id-ID"),
      };

      saveHistory(historyItem);

      if (data.platform) {
        setSelectedPlatform(
          String(data.platform).toLowerCase()
        );
      }
    } catch (err) {
      console.error("Download error:", err);

      setError(
        err?.message ||
          "Terjadi kesalahan saat memproses media."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     DOWNLOAD RESULT
  ========================= */

  const handleResultDownload = async (label = "download") => {
    if (!result) return;

    const downloadURL =
      result.download ||
      result.url ||
      result.video ||
      result.audio ||
      result.downloads?.[0]?.url;

    if (!downloadURL) {
      setError("Link download tidak ditemukan.");
      return;
    }

    await sendNotification("downloaded", {
      title: result.title || "Media",
      platform:
        result.platform ||
        selectedPlatform,
      label,
    });

    window.open(
      downloadURL,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /* =========================
     HISTORY CLICK
  ========================= */

  const selectHistory = (item) => {
    setUrl(
      item.source_url ||
        item.url ||
        ""
    );

    if (item.platform) {
      setSelectedPlatform(
        String(item.platform).toLowerCase()
      );
    }

    setError("");
    setResult(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =========================
     APK
  ========================= */

  const handleAPK = async () => {
    await sendNotification("apk_install");

    if (!APK_LINK || APK_LINK.includes("LINK-APK-KAMU")) {
      setError(
        "Link APK belum dipasang oleh administrator."
      );
      return;
    }

    window.open(
      APK_LINK,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="sidownload-app">

      {/* =========================
          VISITOR
      ========================= */}

      <VisitorCounter />

      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="navbar">
        <div className="brand-wrapper">

          <a
            href="/"
            className="brand-link"
            aria-label="SIDOWNLOAD"
          >
            <div className="brand-icon">
              SI
            </div>

            <div className="brand-text">
              <h2>SIDOWNLOAD</h2>
              <span>
                FAST • SIMPLE • FREE
              </span>
            </div>
          </a>

          <div className="nav-links">
            <a href="#download">
              Download
            </a>

            <a href="#platform">
              Platform
            </a>

            <a href="#rating">
              Rating
            </a>
          </div>

        </div>
      </nav>

      {/* =========================
          MAIN
      ========================= */}

      <main className="content-container">

        {/* HERO */}

        <section className="hero-section">

          <div className="badge-tag">
            <span className="dot"></span>

            <span>
              MEDIA DOWNLOADER
            </span>
          </div>

          <h1 className="hero-title">
            Download Video
            <br />
            & Audio{" "}
            <span className="text-green">
              Tanpa Ribet
            </span>
          </h1>

          <p className="hero-desc">
            Download media favorit kamu
            dengan cepat, sederhana,
            dan gratis.
          </p>

          <div className="hero-buttons">

            <a
              href="#download"
              className="hero-button primary"
            >
              Mulai Download
              <span>↓</span>
            </a>

            <a
              href="#rating"
              className="hero-button secondary"
            >
              ⭐ Rating
            </a>

          </div>

        </section>

        {/* PHONE MOCKUP */}

        <div className="mockup-container">

          <div className="orbit-icon pos-top-left">
            {PLATFORMS[0].icon}
          </div>

          <div className="orbit-icon pos-top-right">
            {PLATFORMS[1].icon}
          </div>

          <div className="orbit-icon pos-mid-left">
            {PLATFORMS[4].icon}
          </div>

          <div className="orbit-icon pos-mid-right">
            {PLATFORMS[5].icon}
          </div>

          <div className="phone-mockup">

            <div className="mockup-notch"></div>

            <div className="mockup-inner">

              <span className="mockup-brand">
                SIDOWNLOAD
              </span>

              <div className="mockup-play-screen">

                <div className="mockup-glow"></div>

                <div className="mockup-play-btn">

                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="#000"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>

                </div>

              </div>

              <div className="mockup-bars">

                <div className="mockup-bar w-long"></div>

                <div className="mockup-bar w-short"></div>

              </div>

              <div className="mockup-download">
                DOWNLOAD
              </div>

            </div>

          </div>

        </div>

        {/* PLATFORM */}

        <section
          id="platform"
          className="platform-section"
        >

          <div className="section-header">

            <span className="section-label">
              SUPPORTED
            </span>

            <h3 className="section-title">
              Pilih Platform
            </h3>

          </div>

          <div className="platform-grid">

            {PLATFORMS.map((platform) => (

              <button
                key={platform.id}
                type="button"
                className={`platform-card ${
                  selectedPlatform === platform.id
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setSelectedPlatform(platform.id)
                }
              >

                <div className="platform-icon">
                  {platform.icon}
                </div>

                <span>
                  {platform.name}
                </span>

                {selectedPlatform === platform.id && (
                  <small>
                    Selected
                  </small>
                )}

              </button>

            ))}

          </div>

        </section>

        {/* DOWNLOAD */}

        <section
          id="download"
          className="download-section"
        >

          <div className="section-header">

            <span className="section-label">
              DOWNLOAD
            </span>

            <h3 className="section-title">
              Masukkan Link
            </h3>

          </div>

          <form
            className="input-card"
            onSubmit={handleDownload}
          >

            <div className="input-field-wrapper">

              <span className="input-link-icon">
                🔗
              </span>

              <input
                type="url"
                className="input-box"
                placeholder="Tempel tautan video / musik di sini..."
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError("");
                }}
                autoComplete="off"
                required
              />

              <button
                type="button"
                className="paste-button"
                onClick={handlePaste}
              >
                PASTE
              </button>

            </div>

            <button
              type="submit"
              className="download-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="spinner"></span>
                  MEMPROSES...
                </>
              ) : (
                <>
                  DOWNLOAD SEKARANG
                  <span>→</span>
                </>
              )}

            </button>

          </form>

          {/* ERROR */}

          {error && (
            <div className="error-box">
              ⚠️ {error}
            </div>
          )}

          {/* RESULT */}

          {result && (
            <div className="download-result">

              {result.thumbnail && (
                <img
                  src={result.thumbnail}
                  alt="Thumbnail"
                  className="result-thumbnail"
                  loading="lazy"
                />
              )}

              <div className="result-info">

                <span>
                  DOWNLOAD READY
                </span>

                <h3>
                  {result.title ||
                    "Media berhasil diproses"}
                </h3>

                <button
                  type="button"
                  className="result-download"
                  onClick={() =>
                    handleResultDownload(
                      "result"
                    )
                  }
                >
                  Download File →
                </button>

              </div>

            </div>
          )}

          <button
            type="button"
            className="clear-button"
            onClick={clearURL}
          >
            CLEAR
          </button>

        </section>

        {/* HISTORY */}

        <section className="history-section">

          <div className="section-header history-header">

            <div>
              <span className="section-label">
                RECENT
              </span>

              <h3 className="section-title">
                Riwayat Download
              </h3>
            </div>

            {history.length > 0 && (
              <button
                type="button"
                className="clear-history"
                onClick={clearHistory}
              >
                Hapus
              </button>
            )}

          </div>

          {history.length === 0 ? (

            <div className="empty-history">

              <div className="empty-history-icon">
                🗂️
              </div>

              <p>
                Belum ada riwayat download.
              </p>

              <small>
                Riwayat download kamu
                akan muncul di sini.
              </small>

            </div>

          ) : (

            <div className="history-list">

              {history.map((item, index) => (

                <button
                  type="button"
                  className="history-item"
                  key={`${item.url}-${index}`}
                  onClick={() =>
                    selectHistory(item)
                  }
                >

                  <div className="history-thumb">

                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt=""
                        loading="lazy"
                      />
                    ) : (
                      <span>
                        ▶
                      </span>
                    )}

                  </div>

                  <div className="history-info">

                    <strong>
                      {item.title ||
                        "Media"}
                    </strong>

                    <small>
                      {item.platform ||
                        "Media"}
                    </small>

                    {item.date && (
                      <em>
                        {item.date}
                      </em>
                    )}

                  </div>

                  <span className="history-arrow">
                    →
                  </span>

                </button>

              ))}

            </div>

          )}

        </section>

        {/* HOW IT WORKS */}

        <section className="steps-section">

          <div className="section-header center">

            <span className="section-label">
              HOW IT WORKS
            </span>

            <h3 className="section-title">
              3 Langkah Mudah
            </h3>

          </div>

          <div className="steps-grid">

            <div className="step-card">

              <span>
                01
              </span>

              <div>
                🔗
              </div>

              <h3>
                Copy Link
              </h3>

              <p>
                Salin link video atau
                media dari platform
                pilihanmu.
              </p>

            </div>

            <div className="step-card">

              <span>
                02
              </span>

              <div>
                ⚡
              </div>

              <h3>
                Paste Link
              </h3>

              <p>
                Tempel link ke kolom
                downloader SIDOWNLOAD.
              </p>

            </div>

            <div className="step-card">

              <span>
                03
              </span>

              <div>
                ⬇️
              </div>

              <h3>
                Download
              </h3>

              <p>
                Klik download dan
                simpan media ke
                perangkatmu.
              </p>

            </div>

          </div>

        </section>

        {/* RATING */}

        <Rating />

        {/* APK */}

        <section className="apk-section">

          <div className="apk-card">

            <div className="apk-icon">
              SI
            </div>

            <div className="apk-info">

              <span>
                ANDROID APP
              </span>

              <h2>
                SIDOWNLOAD APK
              </h2>

              <p>
                Nikmati pengalaman
                download lebih praktis
                langsung dari Android.
              </p>

            </div>

            <button
              type="button"
              className="apk-button"
              onClick={handleAPK}
            >
              Download APK →
            </button>

          </div>

        </section>

      </main>

      {/* FOOTER */}

      <footer className="footer">

        <div className="footer-inner">

          <div>

            <div className="footer-brand">
              SIDOWNLOAD
            </div>

            <p>
              Simple. Fast. Free.
            </p>

          </div>

          <div className="footer-links">

            <a href="#download">
              Download
            </a>

            <a href="#platform">
              Platform
            </a>

            <a href="#rating">
              Rating
            </a>

          </div>

        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} SIDOWNLOAD.
          All rights reserved.
        </div>

      </footer>

    </div>
  );
}

export default App;
