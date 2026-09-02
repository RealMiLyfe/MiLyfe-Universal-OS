'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Play, Pause, SkipForward, SkipBack, X, ChevronUp, ChevronDown, Music, Video,
  Radio, ListMusic, Maximize2, Minimize2,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

/**
 * The Vibe Bar — MiLyfe's global persistent media player.
 *
 * Key behavior (per product intent): the video/audio lives in a SMALL docked
 * bar and never takes over the platform. Tapping "expand" opens a compact
 * FLOATING window (not a full-screen overlay) that sits above the content in a
 * corner — you keep browsing the whole platform while it plays. Works the same
 * whether the current item is audio or video.
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
  const [showQueue, setShowQueue] = useState(false);

  const isVideo = track && (track.kind === 'video' || track.kind === 'short' || track.kind === 'live');
  const isHostedAudio = track && (track.kind === 'audio' || track.kind === 'podcast' || track.kind === 'radio') &&
    (track.sourceType === 'hosted' || track.sourceType === 'mp4');

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !isHostedAudio) return;
    if (playing) el.play().catch(() => setPlaying(false));
    else el.pause();
  }, [playing, track, isHostedAudio, setPlaying]);

  if (!track) return null;

  const Icon = isVideo ? Video : track.kind === 'radio' || track.kind === 'live' ? Radio : Music;

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

      {/* EXPANDED — a compact FLOATING window (does NOT cover the platform).
          Sits in the bottom-right (desktop) / bottom-center (mobile), above the
          docked bar. You can still see and click the rest of the platform. */}
      {expanded && (
        <div
          className="fixed bottom-32 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl animate-slide-up md:bottom-16 md:left-auto md:right-4 md:translate-x-0 lg:right-[19rem] xl:right-[21rem]"
          role="dialog"
          aria-label="Now playing"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
            <span className="text-xs font-semibold text-harbor-800">Now Playing</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPlayerExpanded(false)} aria-label="Minimize"
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
                <Minimize2 className="h-4 w-4" />
              </button>
              <button onClick={closePlayer} aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Media surface */}
          {isVideo ? (
            <div className="aspect-video w-full bg-black">
              <MediaEmbed track={track} />
            </div>
          ) : (
            <div className="flex items-center justify-center bg-gradient-to-br from-teal-500 to-teal-600 py-8">
              {track.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={track.coverUrl} alt="" className="h-32 w-32 rounded-xl object-cover" />
              ) : (
                <Icon className="h-16 w-16 text-white" aria-hidden="true" />
              )}
            </div>
          )}

          {/* Meta + controls */}
          <div className="p-3">
            <p className="truncate text-sm font-bold text-harbor-800">{track.title}</p>
            {track.channelName && <p className="truncate text-xs text-gray-500">{track.channelName}</p>}

            {isHostedAudio && (
              <input
                type="range" min={0} max={duration || 0} value={progress}
                onChange={(e) => { if (audioRef.current) audioRef.current.currentTime = Number(e.target.value); }}
                className="mt-2 w-full accent-teal-600" aria-label="Seek"
              />
            )}

            <div className="mt-1 flex items-center justify-center gap-5">
              <button onClick={prevTrack} aria-label="Previous" className="text-harbor-600 hover:text-teal-600"><SkipBack className="h-5 w-5" /></button>
              <button onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-harbor-700 to-teal-500 text-white shadow-lg">
                {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 pl-0.5" />}
              </button>
              <button onClick={nextTrack} aria-label="Next" className="text-harbor-600 hover:text-teal-600"><SkipForward className="h-5 w-5" /></button>
            </div>

            {playerQueue.length > 1 && (
              <>
                <button onClick={() => setShowQueue((q) => !q)} className="mt-2 inline-flex items-center gap-1 text-xs text-teal-600">
                  <ListMusic className="h-3.5 w-3.5" /> {showQueue ? 'Hide' : 'Show'} queue ({playerQueue.length})
                </button>
                {showQueue && (
                  <div className="mt-1 max-h-28 space-y-0.5 overflow-y-auto">
                    {playerQueue.map((t) => (
                      <div key={t.id} className={`truncate rounded px-2 py-1 text-xs ${t.id === track.id ? 'bg-teal-50 text-harbor-800' : 'text-gray-500'}`}>{t.title}</div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* COLLAPSED — the docked Vibe Bar. Shows a MINI video thumbnail when the
          item is a video (plays inline, tiny), or cover art for audio. */}
      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-gray-100 bg-white/90 backdrop-blur-xl md:bottom-0 md:left-56 lg:left-60 lg:right-72 xl:right-80 safe-area-bottom">
        {isHostedAudio && duration > 0 && (
          <div className="h-0.5 w-full bg-gray-100">
            <div className="h-full bg-teal-500" style={{ width: `${(progress / duration) * 100}%` }} />
          </div>
        )}
        <div className="flex items-center gap-3 px-3 py-2">
          <button onClick={() => setPlayerExpanded(!expanded)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-label="Toggle player window">
            {/* Mini media surface: tiny inline video OR cover */}
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-teal-500 to-teal-600">
              {isVideo ? (
                <span className="flex h-full w-full items-center justify-center">
                  <Video className="h-5 w-5 text-white" aria-hidden="true" />
                </span>
              ) : track.coverUrl ? (
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
            <button onClick={prevTrack} aria-label="Previous" className="hidden h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 sm:flex"><SkipBack className="h-4 w-4" /></button>
            <button onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-harbor-800 text-white hover:bg-harbor-900">
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 pl-0.5" />}
            </button>
            <button onClick={nextTrack} aria-label="Next" className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"><SkipForward className="h-4 w-4" /></button>
            <button onClick={() => setPlayerExpanded(!expanded)} aria-label={expanded ? 'Minimize window' : 'Open window'}
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
              {expanded ? <ChevronDown className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button onClick={closePlayer} aria-label="Close player" className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
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
    return <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${track.sourceUrl}?autoplay=1`} title="video" allow="autoplay; encrypted-media" allowFullScreen />;
  }
  if (track.sourceType === 'vimeo') {
    return <iframe className="h-full w-full" src={`https://player.vimeo.com/video/${track.sourceUrl}`} title="video" allowFullScreen />;
  }
  return <video className="h-full w-full" src={track.sourceUrl} controls playsInline autoPlay />;
}
