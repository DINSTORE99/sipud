export const config = {
  maxDuration: 15,
};

const extractUrl = (text) => {
  if (!text) return "";
  const match = text.match(/https?:\/\/[^\s]+/i);
  if (!match) return text.trim();
  return match[0].replace(/[.,!?;:)\]}]+$/g, "").trim();
};

const detectPlatform = (rawUrl) => {
  const url = extractUrl(rawUrl).toLowerCase();
  if (!url) return null;

  if (url.includes("instagram.com") || url.includes("instagr.am")) return "instagram";
  if (url.includes("facebook.com") || url.includes("fb.watch")) return "facebook";
  if (url.includes("tiktok.com") || url.includes("vt.tiktok.com")) return "tiktok";
  if (url.includes("capcut.com") || url.includes("capcut.net") || url.includes("capcut.cn")) return "capcut";
  if (url.includes("spotify.com") || url.includes("open.spotify.com")) return "spotify";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";

  return null;
};

const safeFetchJson = async (url, timeoutMs = 8000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
      },
    });
    clearTimeout(timer);

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  } catch {
    clearTimeout(timer);
    return null;
  }
};

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Metode tidak diizinkan." });
  }

  const rawUrl = req.method === "POST" ? req.body?.url : req.query?.url;
  const cleanUrl = extractUrl(rawUrl);

  if (!cleanUrl) {
    return res.status(400).json({ success: false, message: "URL tidak boleh kosong." });
  }

  const platform = detectPlatform(cleanUrl);
  if (!platform) {
    return res.status(400).json({
      success: false,
      message: "Platform tidak didukung.",
    });
  }

  try {
    let title = "";
    let thumbnail = "";
    let author = "";
    let duration = "";
    let stats = "";
    const downloads = [];
    const encodedUrl = encodeURIComponent(cleanUrl);

    // YOUTUBE
    if (platform === "youtube") {
      const [mp4Data, mp3Data] = await Promise.all([
        safeFetchJson(`https://api.azbry.com/api/download/ytmp4?url=${encodedUrl}`),
        safeFetchJson(`https://api.azbry.com/api/download/ytmp3?url=${encodedUrl}`),
      ]);

      const validResult = mp4Data?.result || mp3Data?.result;

      if (validResult) {
        title = validResult.title || "YouTube Media";
        author = validResult.channel || validResult.author || "";
        thumbnail = validResult.thumbnail || "";

        if (validResult.duration) {
          const dur = Number(validResult.duration);
          if (!isNaN(dur)) {
            const m = Math.floor(dur / 60);
            const s = dur % 60;
            duration = `${m}:${s < 10 ? "0" : ""}${s}`;
          } else {
            duration = String(validResult.duration);
          }
        }

        if (mp4Data?.result?.download) {
          downloads.push({
            url: mp4Data.result.download,
            text: `Download Video (${mp4Data.result.quality || "MP4"})`,
            type: "youtube",
          });
        }

        if (mp3Data?.result?.download) {
          downloads.push({
            url: mp3Data.result.download,
            text: "Download Audio (MP3)",
            type: "audio",
          });
        }
      }
    }

    // SPOTIFY
    else if (platform === "spotify") {
      const spData = await safeFetchJson(
        `https://api.azbry.com/api/download/spotify?url=${encodedUrl}`
      );

      if (spData && (spData.downloadLink || spData.rawLink)) {
        title = spData.title || "Spotify Track";
        author = spData.author || "";
        thumbnail = spData.cover || "";

        downloads.push({
          url: spData.downloadLink || spData.rawLink,
          text: "Download Audio (MP3)",
          type: "spotify",
        });
      }
    }

    // TIKTOK
    else if (platform === "tiktok") {
      const ttData = await safeFetchJson(
        `https://api.siputzx.my.id/api/d/tiktok/v2?url=${encodedUrl}`
      );
      const root = ttData?.data || ttData || {};

      thumbnail = root?.cover_link || root?.origin_cover || root?.cover || "";
      title = root?.text || root?.title || "TikTok Video";
      author = root?.author_nickname || root?.author?.nickname || "";

      const stat = [];
      if (root?.play_count) stat.push(`👁️ ${root.play_count}`);
      if (root?.like_count) stat.push(`❤️ ${root.like_count}`);
      stats = stat.join("   ");

      const videoLink =
        root?.no_watermark_link_hd || root?.no_watermark_link || root?.play || root?.video;
      if (videoLink) {
        downloads.push({
          url: videoLink,
          text: "Download Video (No Watermark)",
          type: "tiktok",
        });
      }

      const audioLink = root?.music_link || root?.music || root?.audio;
      if (audioLink) {
        downloads.push({
          url: audioLink,
          text: "Download Audio (MP3)",
          type: "audio",
        });
      }
    }

    // CAPCUT
    else if (platform === "capcut") {
      const ccData = await safeFetchJson(
        `https://api.siputzx.my.id/api/d/capcut?url=${encodedUrl}`
      );
      const root = ccData?.data || ccData || {};

      thumbnail = root?.coverUrl || root?.cover_url || root?.thumbnail || "";
      title = root?.title || root?.name || "CapCut Template";
      author = root?.authorName || root?.author || "";

      const capcutLink = root?.originalVideoUrl || root?.videoUrl || root?.downloadUrl || root?.url;
      if (capcutLink) {
        downloads.push({
          url: capcutLink,
          text: "Download Video (MP4)",
          type: "capcut",
        });
      }
    }

    // FACEBOOK
    else if (platform === "facebook") {
      const fbData = await safeFetchJson(
        `https://api.siputzx.my.id/api/d/facebook?url=${encodedUrl}`
      );
      const root = fbData?.data || fbData || {};

      thumbnail = root?.thumbnail || root?.thumb || root?.cover || "";
      title = root?.title || "Facebook Video";
      duration = root?.duration || "";

      if (Array.isArray(root?.downloads)) {
        root.downloads
          .filter((item) => item?.url)
          .forEach((item) => {
            downloads.push({
              url: item.url,
              text: `Download Video - ${item.quality || "Video"}`,
              type: "facebook",
            });
          });
      } else {
        if (root?.hd) downloads.push({ url: root.hd, text: "Video HD (MP4)", type: "facebook" });
        if (root?.sd) downloads.push({ url: root.sd, text: "Video SD (MP4)", type: "facebook" });
      }
    }

    // INSTAGRAM
    else if (platform === "instagram") {
      const igData = await safeFetchJson(
        `https://api.siputzx.my.id/api/d/sssinstagram?url=${encodedUrl}`
      );
      const root = igData?.data || igData || {};

      thumbnail = root?.thumbnail || root?.thumb || root?.cover || "";
      title = root?.title || root?.caption || "Instagram Media";
      author = root?.username || root?.author || "";

      if (Array.isArray(root)) {
        root.forEach((u, i) => {
          const directUrl = typeof u === "string" ? u : u?.url;
          if (directUrl) {
            downloads.push({ url: directUrl, text: `Unduh Media #${i + 1}`, type: "instagram" });
          }
        });
      } else {
        const igLink = root?.download_url || root?.download || root?.video_url || root?.url;
        if (igLink) {
          downloads.push({ url: igLink, text: "Unduh Media", type: "instagram" });
        }
      }
    }

    const uniqueDownloads = downloads.filter(
      (item, index, array) => item.url && array.findIndex((x) => x.url === item.url) === index
    );

    if (uniqueDownloads.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Server penyedia gagal memproses media ini atau link tidak valid.",
      });
    }

    return res.status(200).json({
      success: true,
      platform,
      title,
      thumbnail,
      author,
      duration,
      stats,
      downloads: uniqueDownloads,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Terjadi gangguan saat memproses request di server.",
    });
  }
}
