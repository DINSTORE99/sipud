const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8311271231:AAHzIXX4OuHchJbMGSXoavBxXkjNQg28U0g";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "6452266025";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { type, details } = req.body || {};
  const userAgent = req.headers["user-agent"] || "-";
  const referer = req.headers["referer"] || "-";
  const origin = req.headers["origin"] || referer;

  const timeString = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
  let message = "";

  if (type === "visit") {
    message = `🌐 <b>SIDOWNLOAD</b>\n\n👤 <b>WEBSITE DIBUKA</b>\n\n🔗 <b>URL:</b>\n${origin}\n\n↩️ <b>Referrer:</b>\n${referer}\n\n📱 <b>User Agent:</b>\n<code>${userAgent}</code>\n\n🕐 <b>Waktu:</b>\n${timeString}\n\n━━━━━━━━━━━━━━\nSIDOWNLOAD`;
  } else if (type === "process") {
    message = `🔎 <b>SIDOWNLOAD</b>\n\n📥 <b>LINK DIPROSES</b>\n\n🌐 <b>Platform:</b>\n${details?.platform || "-"}\n\n🔗 <b>Link:</b>\n<code>${details?.url || "-"}</code>\n\n📱 <b>User Agent:</b>\n<code>${userAgent}</code>\n\n🕐 <b>Waktu:</b>\n${timeString}\n\n━━━━━━━━━━━━━━\nSIDOWNLOAD`;
  } else if (type === "downloaded") {
    // Menampilkan seluruh daftar tautan unduhan jika tersedia
    let downloadLinksText = "-";
    if (Array.isArray(details?.downloads) && details.downloads.length > 0) {
      downloadLinksText = details.downloads
        .map((dl, idx) => `${idx + 1}. <b>${dl.text || dl.type || "Link"}</b>: <code>${dl.url}</code>`)
        .join("\n");
    } else if (details?.url) {
      downloadLinksText = `<code>${details.url}</code>`;
    }

    message = `✅ <b>SIDOWNLOAD</b>\n\n🎉 <b>MEDIA BERHASIL DIUNDUH</b>\n\n🏷️ <b>Judul:</b>\n${details?.title || "-"}\n\n🌐 <b>Platform:</b>\n${details?.platform || "-"}\n\n📥 <b>Format Dipilih:</b>\n${details?.label || "-"}\n\n🔗 <b>Daftar Link Unduhan:</b>\n${downloadLinksText}\n\n🕐 <b>Waktu:</b>\n${timeString}\n\n━━━━━━━━━━━━━━\nSIDOWNLOAD`;
  }

  if (!message || !BOT_TOKEN) {
    return res.status(200).json({ success: true, warning: "Bot credentials not set" });
  }

  try {
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
