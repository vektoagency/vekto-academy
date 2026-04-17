"use client";

import { useEffect, useRef, useState } from "react";
import * as tus from "tus-js-client";

type Challenge = {
  id: number;
  title: string;
  description: string | null;
  deadline: string | null;
  prize: string | null;
  status: string;
};

type Submission = {
  id: number;
  bunny_video_id: string;
  notes: string;
  status: string;
  feedback: string | null;
  created_at: string;
};

const statusLabel: Record<string, { label: string; cls: string }> = {
  submitted: { label: "Чака преглед", cls: "bg-amber-500/20 text-amber-400" },
  reviewed: { label: "Прегледано", cls: "bg-blue-500/20 text-blue-400" },
  winner: { label: "🏆 Победител", cls: "bg-[#c8ff00]/20 text-[#c8ff00]" },
  rejected: { label: "Отхвърлено", cls: "bg-red-500/20 text-red-400" },
};

export default function ArenaSubmission() {
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [libraryId, setLibraryId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      const res = await fetch("/api/arena/active");
      const data = await res.json();
      setChallenge(data.challenge);
      setSubmission(data.submission);
      setLibraryId(data.libraryId ?? "");
      if (data.submission?.notes) setNotes(data.submission.notes);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit() {
    if (!file || !challenge) return;
    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      const initRes = await fetch("/api/arena/upload-init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge_id: challenge.id, filename: file.name }),
      });
      if (!initRes.ok) {
        const err = await initRes.json().catch(() => ({}));
        throw new Error(err.error ?? "Грешка при иницииране на качването");
      }
      const { videoId, libraryId, expirationTime, signature, title } = await initRes.json();

      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint: "https://video.bunnycdn.com/tusupload",
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: {
            AuthorizationSignature: signature,
            AuthorizationExpire: String(expirationTime),
            VideoId: videoId,
            LibraryId: libraryId,
          },
          metadata: {
            filetype: file.type,
            title,
          },
          chunkSize: 5 * 1024 * 1024,
          onError: (err) => reject(err),
          onProgress: (sent, total) => {
            setProgress(Math.round((sent / total) * 100));
          },
          onSuccess: () => resolve(),
        });
        upload.start();
      });

      const submitRes = await fetch("/api/arena/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenge_id: challenge.id,
          bunny_video_id: videoId,
          notes,
        }),
      });
      if (!submitRes.ok) {
        const err = await submitRes.json().catch(() => ({}));
        throw new Error(err.error ?? "Грешка при запазване");
      }

      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Неочаквана грешка");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-5 h-5 border-2 border-white/10 border-t-[#c8ff00] rounded-full animate-spin" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="bg-[#111] border border-white/6 rounded-2xl p-8 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center text-2xl">⏳</div>
        <p className="text-sm font-bold text-white/70 mb-1">Няма активно предизвикателство</p>
        <p className="text-xs text-white/40">Следващото стартира скоро. Ще получиш имейл.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Challenge brief */}
      <div className="bg-[#111] border border-white/6 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#c8ff00]">Активна задача</span>
          <span className="text-white/20 text-xs">·</span>
          <span className="text-white/40 text-xs">#{challenge.id}</span>
        </div>
        <h3 className="text-xl font-black text-white/90 mb-2">{challenge.title}</h3>
        {challenge.description && (
          <p className="text-sm text-white/55 leading-relaxed mb-4 whitespace-pre-line">{challenge.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {challenge.prize && (
            <div className="flex items-center gap-1.5">
              <span className="text-white/30">Награда:</span>
              <span className="text-[#c8ff00] font-bold">{challenge.prize}</span>
            </div>
          )}
          {challenge.deadline && (
            <div className="flex items-center gap-1.5">
              <span className="text-white/30">Краен срок:</span>
              <span className="text-white/70 font-bold">
                {new Date(challenge.deadline).toLocaleDateString("bg-BG")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Existing submission status */}
      {submission && (
        <div className="bg-[#111] border border-white/6 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Твоята предложба</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusLabel[submission.status]?.cls ?? "bg-white/10 text-white/40"}`}>
              {statusLabel[submission.status]?.label ?? submission.status}
            </span>
          </div>
          <div className="aspect-video bg-black rounded-xl overflow-hidden mb-3 relative">
            {libraryId ? (
              <iframe
                src={`https://iframe.mediadelivery.net/embed/${libraryId}/${submission.bunny_video_id}?autoplay=false`}
                loading="lazy"
                className="w-full h-full"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
                Видеото се обработва... презареди страницата след минута.
              </div>
            )}
          </div>
          {submission.notes && (
            <p className="text-xs text-white/50 leading-relaxed mb-3 whitespace-pre-line">{submission.notes}</p>
          )}
          {submission.feedback && (
            <div className="bg-white/3 border border-white/6 rounded-xl p-3 mt-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Обратна връзка</p>
              <p className="text-xs text-white/70 leading-relaxed whitespace-pre-line">{submission.feedback}</p>
            </div>
          )}
          <p className="text-[10px] text-white/25 mt-3">
            Предадено: {new Date(submission.created_at).toLocaleString("bg-BG")}
          </p>
        </div>
      )}

      {/* Upload form (allow re-submit while submitted/reviewed, lock after winner) */}
      {submission?.status !== "winner" && (
        <div className="bg-[#111] border border-white/6 rounded-2xl p-6 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-white/80">
              {submission ? "Презареди ново видео" : "Качи проекта си"}
            </h4>
            <p className="text-xs text-white/40 mt-1">MP4 / MOV до 2GB. Качването е директно към Bunny Stream.</p>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Видео файл</label>
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              disabled={uploading}
              className="block w-full text-xs text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white/5 file:text-white/70 hover:file:bg-white/10 file:cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Бележки (по избор)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={uploading}
              rows={3}
              maxLength={1000}
              placeholder="Кратко обяснение на подхода, инструменти, времето за изработка..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8ff00]/30 resize-none"
            />
          </div>

          {uploading && (
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="text-white/40">Качване...</span>
                <span className="text-[#c8ff00] font-bold">{progress}%</span>
              </div>
              <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#c8ff00] rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!file || uploading}
            className="w-full px-5 py-3 rounded-xl bg-[#c8ff00] text-black text-sm font-bold hover:bg-[#d4ff33] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {uploading ? "Качва се..." : submission ? "Презареди →" : "Предай задачата →"}
          </button>
        </div>
      )}
    </div>
  );
}
