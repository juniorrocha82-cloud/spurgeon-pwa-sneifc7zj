ALTER TABLE public.youtube_playlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on youtube_playlists" ON public.youtube_playlists;
CREATE POLICY "Allow public read access on youtube_playlists"
  ON public.youtube_playlists
  FOR SELECT
  TO public
  USING (true);

INSERT INTO public.youtube_playlists (
  id,
  channel_name,
  channel_url,
  playlist_id,
  playlist_name,
  description,
  thumbnail_url,
  video_count
) VALUES (
  gen_random_uuid(),
  'Spurgeon One',
  'https://youtube.com/@SpurgeonOne',
  'PLS7Kqj3rKpLyS3kTsPtaQVj3MQWNhenWq',
  'Minha Playlist de Adoração',
  'Acompanhe as atualizações diárias de músicas e compartilhe com seus irmãos!',
  'https://img.usecurling.com/p/1280/720?q=worship&color=black',
  10
) ON CONFLICT (playlist_id) DO UPDATE SET
  playlist_name = EXCLUDED.playlist_name,
  description = EXCLUDED.description,
  thumbnail_url = EXCLUDED.thumbnail_url;
