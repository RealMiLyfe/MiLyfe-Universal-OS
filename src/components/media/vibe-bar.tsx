'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Play, Pause, SkipForward, SkipBack, X, ChevronUp, ChevronDown, Music, Video,
  Radio, ListMusic, Volume2,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

/**
 * The Vibe Bar — MiLyfe's global persistent media player.
 * Docks into the shell (bottom of content column on desktop, above bottom-nav
 * on mobile). Keeps playing as you move across every surface. Collapsed bar +
 * expanded "Now Playing". Light glass, on-brand. No ads. This is where MiLyfe
 * shines — the vibe follows you.
 */
export function VibeBar() {
  const {
    playerTrack: track, playerPlaying: playing, playerExpanded: expanded,
    togglePlay, setPlaying, nextTrack, prevTrack, closePlayer, setPlayerExpanded,
    playerQueue,
  } = useAppStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const isHostedAudio = track && (track.kind === 'audio' || track.kind === 'podcast') &&
    (track.sourceType === 'hosted' || track.sourceType === 'mp4');

  // Drive the audio element for hosted audio.
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !isHostedAudio) return;
    if (playing) el.play().catch(() => setPlaying(false));
    else el.pause();
  }, [playing, track, isHostedAudio, setPlaying]);

  if (!track) return null;

  const Icon = track.kind === 'video' || track.kind === 'short' ? Video
    : track.kind === 'radio' || track.kind === 'live' ? Radio : Music;

  return (
    <>
      {/* Hidden audio element for hosted audio playback */}
      {isHostedAudio && track.sourceUrl && (
        <audio
          ref={audioRef}
          src={track.sourceUrl}
          onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => nextTrack()}
        />
      )}

      {/* EXPANDED — Now Playing */}
      {expanded && (
        <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-teal-50/95 via-white to-mly-50/80 backdrop-blur-xl animate-slide-up md:left-56 lg:left-60">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="text-sm font-semibold text-harbor-800">Now Playing</span>
            <button onClick={() => setPlayerExpanded(false)} aria-label="Collapse player"
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-white/60">
              <ChevronDown className="h-6 w-6" />
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-6 overflow-y-auto p-6">
            {(track.kind === 'video' || track.kind === 'short' || track.kind === 'live') ? (
              <div className="aspect-video w-full max-w-2xl overflow-hidden rounded-xl bg-harbor-900/5">
                <MediaEmbed track={track} />
              </div>
            ) : (
              <div className="flex h-56 w-56 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-xl shadow-teal-500/20">
                {track.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={track.coverUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Icon className="h-20 w-20 text-white" aria-hidden="true" />
                )}
              </div>
            )}

            <div className="text-center">
              <p className="text-xl font-bold text-harbor-800">{track.title}</p>
              {track.channelName && <p className="text-gray-500">{track.channelName}</p>}
            </div>

            {/* Scrubber (hosted audio) */}
            {isHostedAudio && (
              <div className="w-full max-w-md">
                <input
                  type="range" min={0} max={duration || 0} value={progress}
                  onChange={(e) => { if (audioRef.current) audioRef.current.currentTime = Number(e.target.value); }}
                  className="w-full accent-teal-600"
                  aria-label="Seek"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{fmt(progress)}</span><span>{fmt(duration)}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-6">
              <button onClick={prevTrack} aria-label="Previous" className="text-harbor-700 hover:text-teal-600">
                <SkipBack className="h-7 w-7" />
              </button>
              <button onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-harbor-700 to-teal-500 text-white shadow-lg">
                {playing ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 pl-0.5" />}
              </button>
              <button onClick={nextTrack} aria-label="Next" className="text-harbor-700 hover:text-teal-600">
                <SkipForward className="h-7 w-7" />
              </button>
            </div>

            {playerQueue.length > 1 && (
              <div className="w-full max-w-md">
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-harbor-800">
                  <ListMusic className="h-4 w-4" /> Up next
                </p>
                <div className="space-y-1">
                  {playerQueue.map((t) => (
                    <div key={t.id} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${t.id === track.id ? 'bg-teal-50 text-harbor-800' : 'text-gray-500'}`}>
                      <Music className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{t.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COLLAPSED — the Vibe Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-gray-100 bg-white/90 backdrop-blur-xl md:bottom-0 md:left-56 lg:left-60 lg:right-72 xl:right-80 safe-area-bottom">
        {/* progress line */}
        {isHostedAudio && duration > 0 && (
          <div className="h-0.5 w-full bg-gray-100">
            <div className="h-full bg-teal-500" style={{ width: `${(progress / duration) * 100}%` }} />
          </div>
        )}
        <div className="flex items-center gap-3 px-3 py-2">
          <button onClick={() => setPlayerExpanded(true)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-label="Expand player">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-teal-500 to-teal-600">
              {track.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={track.coverUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <Icon className="h-5 w-5 text-white" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-harbor-800">{track.title}</p>
              {track.channelName && <p className="truncate text-xs text-gray-500">{track.channelName}</p>}
            </div>
          </button>

          <div className="flex shrink-0 items-center gap-1">
            <button onClick={prevTrack} aria-label="Previous" className="hidden h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 sm:flex">
              <SkipBack className="h-4 w-4" />
            </button>
            <button onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-harbor-800 text-white hover:bg-harbor-900">
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 pl-0.5" />}
            </button>
            <button onClick={nextTrack} aria-label="Next" className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">
              <SkipForward className="h-4 w-4" />
            </button>
            <button onClick={() => setPlayerExpanded(true)} aria-label="Expand" className="hidden h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 md:flex">
              <ChevronUp className="h-4 w-4" />
            </button>
            <button onClick={closePlayer} aria-label="Close player" className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/** Embed frame for remote video/live sources. Hosted mp4 uses a video tag. */
function MediaEmbed({ track }: { track: { sourceType: string; sourceUrl?: string | null } }) {
  if (!track.sourceUrl) return null;
  if (track.sourceType === 'youtube') {
    return <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${track.sourceUrl}`} title="video" allowFullScreen />;
  }
  if (track.sourceType === 'vimeo') {
    return <iframe className="h-full w-full" src={`https://player.vimeo.com/video/${track.sourceUrl}`} title="video" allowFullScreen />;
  }
  // hosted / mp4 / hls
  return <video className="h-full w-full" src={track.sourceUrl} controls playsInline />;
}

function fmt(s: number): string {
  if (!s || !isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
