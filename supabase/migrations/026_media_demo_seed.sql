-- ============================================================================
-- MiLyfe — Media demo seed (so the Vibe Bar has something to play)
-- Migration 026
--
-- Seeds a "MiLyfe Radio" channel + a few public-domain / freely-embeddable
-- sample items so the media pages and the global Vibe Bar are visible out of
-- the box. Uses a well-known public-domain audio file and YouTube embeds.
-- Owner is set to the first profile if one exists; otherwise left null-safe.
-- Safe to run once; ON CONFLICT guards re-runs.
-- ============================================================================

DO $$
DECLARE
  v_owner UUID;
  v_channel UUID := '22222222-0000-0000-0000-000000000001';
BEGIN
  -- Pick any existing profile as the demo channel owner (optional).
  SELECT id INTO v_owner FROM public.profiles ORDER BY created_at LIMIT 1;

  IF v_owner IS NOT NULL THEN
    INSERT INTO public.media_channels (id, owner_id, slug, name, bio, verified)
    VALUES (v_channel, v_owner, 'milyfe-radio', 'MiLyfe Radio', 'Community vibes, curated by the people.', TRUE)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.media_items (channel_id, uploader_id, kind, title, description, source_type, source_url, duration_seconds, genres, visibility, status)
    VALUES
      (v_channel, v_owner, 'audio', 'Sample Vibe (Demo)', 'A short public-domain audio sample to show the player.', 'mp4', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 372, ARRAY['Demo'], 'public', 'ready'),
      (v_channel, v_owner, 'audio', 'Evening Set (Demo)', 'Another demo track.', 'mp4', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 425, ARRAY['Demo'], 'public', 'ready'),
      (v_channel, v_owner, 'video', 'Welcome to MiLyfe (Demo)', 'A demo video card.', 'youtube', 'aqz-KE-bpKQ', 60, ARRAY['Demo'], 'public', 'ready')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
