import { useState, useEffect } from "react";
import "./style.css";

const PLATFORMS = [
  {
    id: "tiktok",
    name: "TikTok",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#00f2fe">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-1.07V9.42a6.32 6.32 0 1 0 6.34 6.32V8.87a8.16 8.16 0 0 0 4.77 1.52V6.95a4.85 4.85 0 0 1-1-.26z"/>
      </svg>
    ),
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#e1306c">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
      </svg>
    ),
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#1877f2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    id: "capcut",
    name: "CapCut",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff">
        <path d="M4 8l8-4.5L20 8l-8 4.5L4 8zm0 8l8 4.5 8-4.5-8-4.5-8 4.5z"/>
      </svg>
    ),
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#ff0000">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    id: "spotify",
    name: "Spotify",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#1ed760">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.502 17.307a.75.75 0 0 1-1.034.25c-2.83-1.73-6.393-2.122-10.59-1.164a.75.75 0 1 1-.334-1.462c4.593-1.05 8.547-.604 11.708 1.342.348.213.46.666.25 1.034zm1.47-3.268a.938.938 0 0 1-1.29.312c-3.238-1.99-8.175-2.565-12.007-1.4a.938.938 0 0 1-.546-1.794c4.379-1.33 9.83-.695 13.53 1.59a.937.937 0 0 1 .313 1.292zm.129-3.418c-3.882-2.305-10.29-2.518-14.01-1.389a1.125 1.125 0 0 1-.652-2.153c4.275-1.297 11.346-1.045 15.815 1.61a1.125 1.125 0 1 1-1.153 1.932z"/>
      </svg>
    ),
  },
];

export default function App() {
  const [url, setUrl] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const sendTelegramNotification = (type, details = {}) => {
    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, details }),
    }).catch(() => {});
  };

  useEffect(() => {
    sendTelegramNotification("visit");

    try {
      const saved = localStorage.getItem("sidownload_history");
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  const saveToHistory = (item) => {
    const updated = [item, ...history.filter((h) => h.url !== item.url)].slice(0, 8);
    setHistory(updated);
    try {
      localStorage.setItem("sidownload_history", JSON.stringify(updated));
    } catch {}
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("sidownload_history");
    } catch {}
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setError("");
      }
    } catch {
      setError("Izin clipboard ditolak. Silakan tempel secara manual.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Masukkan tautan terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    sendTelegramNotification("process", { url });

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const rawText = await res.text();
      let data = null;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error("Server sedang sibuk. Silakan coba kembali sesaat lagi.");
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal memproses media.");
      }

      setResult(data);
      if (data.platform) setSelectedPlatform(data.platform);

      saveToHistory({
        title: data.title || "Media File",
        platform: data.platform,
        url: data.downloads?.[0]?.url || url,
        date: new Date().toLocaleDateString("id-ID"),
      });
    } catch (err) {
      setError(err.message || "Terjadi kendala saat menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadClick = (label) => {
    sendTelegramNotification("downloaded", {
      title: result?.title,
      platform: result?.platform,
      label,
    });
  };

  const clearResult = () => {
    setUrl("");
    setResult(null);
    setError("");
  };

  return (
    <div className="sidownload-app">
      <nav className="navbar">
        <div className="brand-wrapper">
          <div className="brand-icon">S</div>
          <div className="brand-text">
            <h2>SIDOWNLOAD</h2>
            <span>FAST • SIMPLE • FREE</span>
          </div>
        </div>

        <a
          href="https://api.dinn.my.id"
          target="_blank"
          rel="noopener noreferrer"
          className="doc-btn"
        >
          <span>DOC</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
      </nav>

      <main className="content-container">
        <section className="hero-section">
          <div className="badge-tag">
            <span className="dot"></span>
            <span>MEDIA DOWNLOADER</span>
          </div>
          <h1 className="hero-title">
            Download Video <br />
            & Audio <span className="text-green">Tanpa Ribet</span>
          </h1>
          <p className="hero-desc">
            Download media favorit kamu dengan cepat, sederhana, dan gratis.
          </p>
        </section>

        <div className="mockup-container">
          <div className="orbit-icon pos-top-left">{PLATFORMS[0].icon}</div>
          <div className="orbit-icon pos-top-right">{PLATFORMS[1].icon}</div>
          <div className="orbit-icon pos-mid-left">{PLATFORMS[4].icon}</div>
          <div className="orbit-icon pos-mid-right">{PLATFORMS[5].icon}</div>

          <div className="phone-mockup">
            <div className="mockup-inner">
              <span className="mockup-brand">SIDOWNLOAD</span>
              <div className="mockup-play-screen">
                <div className="mockup-glow"></div>
                <div className="mockup-play-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#000">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
              </div>
              <div className="mockup-bars">
                <div className="mockup-bar w-long"></div>
                <div className="mockup-bar w-short"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="section-header">
          <span className="section-label">SUPPORTED</span>
          <h3 className="section-title">Pilih Platform</h3>
        </div>

        <div className="platform-grid">
          {PLATFORMS.map((item) => (
            <div
              key={item.id}
              className={`platform-card ${selectedPlatform === item.id ? "active" : ""}`}
              onClick={() => setSelectedPlatform(item.id)}
            >
              {item.icon}
              <span>{item.name}</span>
            </div>
          ))}
        </div>

        <div className="section-header">
          <span className="section-label">DOWNLOAD</span>
          <h3 className="section-title">Masukkan Link</h3>
        </div>

        <form className="input-card" onSubmit={handleSubmit}>
          <div className="input-field-wrapper">
            <input
              type="text"
              className="input-box"
              placeholder="Tempel tautan video / musik di sini..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError("");
              }}
            />
            <button
              type="button"
              className="paste-btn"
              onClick={handlePaste}
              title="Tempel dari Clipboard"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
              <span>Paste</span>
            </button>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading || !url.trim()}
          >
            {loading ? "Memproses..." : "Download Sekarang"}
          </button>

          {error && <div className="msg-error">❌ {error}</div>}

          {result && (
            <div className="result-card">
              <div className="result-header">
                <span className="section-label">DETAIL MEDIA</span>
                <span className="platform-badge">{result.platform}</span>
              </div>

              {result.thumbnail && (
                <div className="media-thumbnail-wrapper">
                  <img
                    src={result.thumbnail}
                    alt="Thumbnail"
                    className="media-thumbnail"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  {result.duration && <span className="media-duration">{result.duration}</span>}
                </div>
              )}

              <h4 className="media-title">{result.title}</h4>

              {result.author && (
                <div className="media-author">
                  <span>👤 {result.author}</span>
                </div>
              )}

              {result.stats && <div className="media-stats">{result.stats}</div>}

              <div className="download-options-title">OPSI UNDUHAN</div>

              <div className="download-buttons-group">
                {result.downloads?.map((item, index) => (
                  <a
                    key={`${item.url}-${index}`}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className={`download-link download-${item.type || result.platform}`}
                    onClick={() => handleDownloadClick(item.text)}
                  >
                    <span>{item.text}</span>
                    <span>↓</span>
                  </a>
                ))}
              </div>

              <button type="button" className="clear-btn" onClick={clearResult}>
                ← Cari Link Lain
              </button>
            </div>
          )}
        </form>

        {history.length > 0 && (
          <div className="history-section">
            <div className="history-header">
              <span className="section-label">RIWAYAT</span>
              <button className="clear-history-btn" onClick={clearHistory}>
                Hapus
              </button>
            </div>
            <div className="history-list">
              {history.map((item, i) => (
                <div key={i} className="history-item">
                  <div className="history-meta">
                    <span className="history-title">{item.title}</span>
                    <span className="history-date">
                      {item.platform?.toUpperCase()} • {item.date}
                    </span>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="history-dl-btn"
                  >
                    ↓
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <section className="instructions-section">
          <div className="section-header">
            <span className="section-label">PANDUAN</span>
            <h3 className="section-title">Cara Penggunaan</h3>
          </div>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Salin Link Media</h4>
                <p>Buka aplikasi TikTok, IG, YT, Spotify, dll., lalu klik tombol bagikan dan salin tautannya.</p>
              </div>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Tekan Tombol Paste</h4>
                <p>Klik tombol Paste di dalam kotak input untuk menempel link secara cepat.</p>
              </div>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Klik Download Sekarang</h4>
                <p>Pilih opsi resolusi video atau audio MP3 yang muncul untuk mulai mengunduh.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="app-footer-custom">
        <div className="footer-brand-section">
          <div className="brand-wrapper">
            <div className="brand-icon">S</div>
            <div className="brand-text">
              <h2>SIDOWNLOAD</h2>
              <span>FAST • SIMPLE • FREE</span>
            </div>
          </div>
          <p className="footer-tagline">
            Platform download gratis, cepat, mudah dan tanpa ribet.
          </p>
        </div>

        <div className="footer-links-group">
          <div className="footer-column">
            <h4>Platform</h4>
            <ul>
              <li><a href="#tiktok">TikTok</a></li>
              <li><a href="#youtube">YouTube</a></li>
              <li><a href="#instagram">Instagram</a></li>
              <li><a href="#spotify">Spotify</a></li>
              <li><a href="#facebook">Facebook</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Tools</h4>
            <ul>
              <li><a href="#tiktok">TikTok Downloader</a></li>
              <li><a href="#youtube">YouTube Downloader</a></li>
              <li><a href="#spotify">Spotify Downloader</a></li>
              <li><a href="#instagram">Instagram Downloader</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Informasi</h4>
            <ul>
              <li><a href="https://api.dinn.my.id" target="_blank" rel="noreferrer">Dokumentasi API</a></li>
              <li><a href="#status">Status Layanan</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="api-access-card">
          <div className="api-card-text">
            <h3>API Access</h3>
            <p>Gunakan API kami untuk integrasi di website atau bot kamu.</p>
          </div>
          <a href="https://api.dinn.my.id" target="_blank" rel="noopener noreferrer" className="api-card-btn">
            Lihat Dokumentasi API →
          </a>
        </div>

        <div className="footer-bottom-copyright">
          <p>© 2026 SIDOWNLOAD. All rights reserved.</p>
          <p className="footer-sub-text">Made with <span style={{ color: "#ef4444" }}>❤️</span> for everyone</p>
        </div>
      </footer>
    </div>
  );
}
