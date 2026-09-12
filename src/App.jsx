import { useEffect, useState } from "react";
import "./style.css";

import VisitorCounter from "./components/VisitorCounter";
import Rating from "./components/Rating";
import { supabase } from "./lib/supabase";

const APK_LINK = "https://sfile.mobi/LINK-APK-KAMU";

const platforms = [
  {
    id: "tiktok",
    name: "TikTok",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.24V2h-3.4v13.67a2.9 2.9 0 1 1-2.9-2.9c.3 0 .59.05.86.13V9.43a6.28 6.28 0 0 0-.86-.06A6.3 6.3 0 1 0 15.82 15V8.84a8.22 8.22 0 0 0 4.8 1.53V6.99c-.35 0-.69-.1-1.03-.3Z" />
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

    notifyVisit();
  }, []);

  const notifyVisit = async () => {
    try {
      await fetch("/api/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "visit",
        }),
      });
    } catch {
      // notification tidak boleh mengganggu website
    }
  };

  const notifyDownload = async () => {
    try {
      await fetch("/api/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "downloaded",
        }),
      });
    } catch {
      // ignore
    }
  };

  const pasteURL = async () => {
    try {
      const text = await navigator.clipboard.readText();

      if (text) {
        setUrl(text);
        setError("");
      }
    } catch {
      setError("Clipboard tidak dapat diakses.");
    }
  };

  const clearURL = () => {
    setUrl("");
    setResult(null);
    setError("");
  };

  const saveHistory = (item) => {
    const updated = [
      item,
      ...history.filter((old) => old.url !== item.url),
    ].slice(0, 8);

    setHistory(updated);

    localStorage.setItem(
      "sidownload_history",
      JSON.stringify(updated)
    );
  };

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

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Gagal mengambil media."
        );
      }

      setResult(data);

      const historyItem = {
        url: cleanURL,
        platform: selectedPlatform,
        title: data.title || "Media",
        thumbnail: data.thumbnail || null,
        created_at: Date.now(),
      };

      saveHistory(historyItem);

      await notifyDownload();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Terjadi kesalahan. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;

    const downloadURL =
      result.download ||
      result.url ||
      result.video ||
      result.audio;

    if (!downloadURL) {
      setError("Link download tidak ditemukan.");
      return;
    }

    window.open(downloadURL, "_blank", "noopener,noreferrer");
  };

  const selectHistory = (item) => {
    setUrl(item.url);

    if (item.platform) {
      setSelectedPlatform(item.platform);
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleAPK = async () => {
    try {
      await fetch("/api/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "apk_install",
        }),
      });
    } catch {
      // ignore
    }

    window.open(
      APK_LINK,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="app">

      {/* VISITOR */}
      <VisitorCounter />

      {/* NAVBAR */}
      <header className="navbar">
        <div className="nav-inner">

          <a href="/" className="brand">
            <span className="brand-icon">SI</span>

            <span>
              <strong>SIDOWNLOAD</strong>
              <small>MEDIA DOWNLOADER</small>
            </span>
          </a>

          <nav className="nav-menu">
            <a href="#download">Download</a>
            <a href="#platform">Platform</a>
            <a href="#rating">Rating</a>
          </nav>

        </div>
      </header>

      {/* HERO */}
      <main>

        <section className="hero">

          <div className="hero-content">

            <div className="hero-badge">
              <span className="status-dot"></span>
              ONLINE & READY
            </div>

            <h1>
              Download Media
              <br />
              <span>Tanpa Ribet.</span>
            </h1>

            <p>
              Download video dan audio dari berbagai
              platform dengan cepat, mudah, dan gratis.
            </p>

            <div className="hero-actions">
              <a
                href="#download"
                className="primary-button"
              >
                Mulai Download
                <span>↓</span>
              </a>

              <a
                href="#rating"
                className="secondary-button"
              >
                ⭐ Rating
              </a>
            </div>

          </div>

          {/* PHONE MOCKUP */}
          <div className="hero-visual">

            <div className="phone">

              <div className="phone-notch"></div>

              <div className="phone-screen">

                <div className="phone-top">
                  <span>SIDOWNLOAD</span>
                  <span>•••</span>
                </div>

                <div className="phone-card">

                  <div className="phone-play">
                    ▶
                  </div>

                  <div>
                    <strong>
                      Fast Downloader
                    </strong>

                    <small>
                      Simple • Fast • Free
                    </small>
                  </div>

                </div>

                <div className="phone-lines">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <div className="phone-download">
                  Download
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* PLATFORM */}
        <section
          className="platform-section"
          id="platform"
        >

          <div className="section-heading">
            <span>SUPPORTED PLATFORM</span>
            <h2>Pilih Platform</h2>
          </div>

          <div className="platform-grid">

            {platforms.map((platform) => (
              <button
                key={platform.id}
                type="button"
                className={
                  selectedPlatform === platform.id
                    ? "platform-card active"
                    : "platform-card"
                }
                onClick={() =>
                  setSelectedPlatform(platform.id)
                }
              >
                <div className="platform-icon">
                  {platform.icon}
                </div>

                <span>{platform.name}</span>

                {selectedPlatform === platform.id && (
                  <small>Selected</small>
                )}
              </button>
            ))}

          </div>

        </section>

        {/* DOWNLOAD */}
        <section
          className="download-section"
          id="download"
        >

          <div className="download-box">

            <div className="download-heading">
              <span className="download-number">
                01
              </span>

              <div>
                <span>DOWNLOAD MEDIA</span>
                <h2>Masukkan Link</h2>
              </div>
            </div>

            <form onSubmit={handleDownload}>

              <div className="url-input-wrapper">

                <span className="link-icon">
                  🔗
                </span>

                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError("");
                  }}
                  placeholder="Paste link video di sini..."
                  autoComplete="off"
                />

                <button
                  type="button"
                  className="paste-button"
                  onClick={pasteURL}
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

            {error && (
              <div className="error-box">
                ⚠️ {error}
              </div>
            )}

            {result && (
              <div className="download-result">

                {result.thumbnail && (
                  <img
                    src={result.thumbnail}
                    alt=""
                    className="result-thumbnail"
                  />
                )}

                <div className="result-info">

                  <span>DOWNLOAD READY</span>

                  <h3>
                    {result.title || "Media berhasil diproses"}
                  </h3>

                  <button
                    type="button"
                    onClick={downloadResult}
                    className="result-download"
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

          </div>

        </section>

        {/* HISTORY */}
        <section className="history-section">

          <div className="section-heading">
            <span>RECENT</span>
            <h2>Riwayat Download</h2>
          </div>

          {history.length === 0 ? (
            <div className="empty-history">
              <div>🗂️</div>

              <p>
                Belum ada riwayat download.
              </p>

              <small>
                Riwayat download kamu akan muncul di sini.
              </small>
            </div>
          ) : (
            <div className="history-list">

              {history.map((item, index) => (
                <button
                  type="button"
                  className="history-item"
                  key={`${item.url}-${index}`}
                  onClick={() => selectHistory(item)}
                >

                  <div className="history-thumb">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt=""
                      />
                    ) : (
                      <span>▶</span>
                    )}
                  </div>

                  <div className="history-info">
                    <strong>
                      {item.title || "Media"}
                    </strong>

                    <small>
                      {item.platform || "Media"}
                    </small>
                  </div>

                  <span className="history-arrow">
                    →
                  </span>

                </button>
              ))}

            </div>
          )}

        </section>

        {/* HOW TO */}
        <section className="steps-section">

          <div className="section-heading center">
            <span>HOW IT WORKS</span>
            <h2>3 Langkah Mudah</h2>
          </div>

          <div className="steps-grid">

            <div className="step-card">
              <span>01</span>
              <div>🔗</div>
              <h3>Copy Link</h3>
              <p>
                Salin link video atau media
                dari platform pilihanmu.
              </p>
            </div>

            <div className="step-card">
              <span>02</span>
              <div>⚡</div>
              <h3>Paste Link</h3>
              <p>
                Tempel link ke kolom
                downloader SIDOWNLOAD.
              </p>
            </div>

            <div className="step-card">
              <span>03</span>
              <div>⬇️</div>
              <h3>Download</h3>
              <p>
                Klik download dan simpan
                media ke perangkatmu.
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
              <span>COMING SOON</span>

              <h2>
                SIDOWNLOAD APK
              </h2>

              <p>
                Nikmati pengalaman download
                lebih praktis langsung dari Android.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAPK}
              className="apk-button"
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
