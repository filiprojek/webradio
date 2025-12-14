import "dotenv/config";
import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import cors from "cors";
import { spawn } from "node:child_process";

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json());

const {
  PORT = 3000,
  LIBRARY_DIR,
  ICECAST_HOST,
  ICECAST_PORT,
  ICECAST_MOUNT = "/radio",
  ICECAST_USER = "source",
  ICECAST_PASS,
  MP3_BITRATE = "256k",
} = process.env;

if (!LIBRARY_DIR) throw new Error("LIBRARY_DIR missing");
if (!ICECAST_HOST || !ICECAST_PORT || !ICECAST_PASS)
  throw new Error("ICECAST config missing");

const AUDIO_EXT = new Set([".mp3", ".ogg", ".aac", ".m4a", ".flac", ".wav"]);

let ffmpeg = null;
let currentPlaylist = null;

function safeName(name) {
  if (!name || name.includes("..") || name.includes("/") || name.includes("\\")) {
    return null;
  }
  return name;
}

function icecastUrl() {
  return `icecast://${encodeURIComponent(ICECAST_USER)}:${encodeURIComponent(
    ICECAST_PASS
  )}@${ICECAST_HOST}:${ICECAST_PORT}${ICECAST_MOUNT.startsWith("/") ? ICECAST_MOUNT : "/" + ICECAST_MOUNT}`;
}

function stopStream() {
  if (ffmpeg) {
    ffmpeg.kill("SIGTERM");
    ffmpeg = null;
    currentPlaylist = null;
  }
}

async function listAudioFiles(dir) {
  const files = await fs.readdir(dir);
  return files
    .filter((f) => AUDIO_EXT.has(path.extname(f).toLowerCase()))
    .map((f) => path.join(dir, f));
}

// API

app.get("/api/playlists", async (req, res) => {
  try {
    const entries = await fs.readdir(LIBRARY_DIR, { withFileTypes: true });
    const playlists = entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b));
    res.json({ playlists });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get("/api/status", (req, res) => {
  res.json({
    playing: !!ffmpeg,
    playlist: currentPlaylist,
  });
});

app.post("/api/play", async (req, res) => {
  const name = safeName(req.body?.playlist);
  if (!name) return res.status(400).json({ error: "Invalid playlist" });

  const dir = path.join(LIBRARY_DIR, name);

  try {
    const stat = await fs.stat(dir);
    if (!stat.isDirectory()) throw new Error();
  } catch {
    return res.status(404).json({ error: "Playlist not found" });
  }

  const files = await listAudioFiles(dir);
  if (files.length === 0) {
    return res.status(400).json({ error: "Playlist is empty" });
  }

  stopStream();
  await new Promise(r => setTimeout(r, 1200));

  const listFile = files.map((f) => `file '${f.replace(/'/g, "'\\''")}'`).join("\n");

  const tmpList = `/tmp/playlist-${Date.now()}.txt`;
  await fs.writeFile(tmpList, listFile);

  const args = [
  "-hide_banner",
  "-loglevel", "warning",

  "-re",
  "-f", "concat",
  "-safe", "0",
  "-i", tmpList,

  "-f", "lavfi",
  "-i", "anullsrc=channel_layout=stereo:sample_rate=48000",

  "-filter_complex", "[0:a][1:a]concat=n=2:v=0:a=1[a]",
  "-map", "[a]",

  "-c:a", "libmp3lame",
  "-b:a", MP3_BITRATE,
  "-content_type", "audio/mpeg",
  "-f", "mp3",
  icecastUrl(),
];
  ffmpeg = spawn("ffmpeg", args);
  currentPlaylist = name;

  ffmpeg.stderr.on("data", (d) => console.log(d.toString().trim()));
  ffmpeg.on("exit", () => {
    ffmpeg = null;
    currentPlaylist = null;
  });

  res.json({ ok: true, playlist: name });
});

app.post("/api/stop", (req, res) => {
  stopStream();
  res.json({ ok: true });
});

app.listen(Number(PORT), () => {
  console.log(`Radio controller running on :${PORT}`);
})
