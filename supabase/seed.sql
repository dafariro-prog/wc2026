-- ===========================================================================
-- WC 2026! - Datos semilla: los 4 usuarios.
-- Ejecuta DESPUÉS de schema.sql, en: Supabase > SQL Editor > Run
--
-- PINs por defecto (¡cámbialos luego desde la app o regenerando hashes!):
--   Daniel  (admin)  -> 1234
--   Camilo  (player) -> 1111
--   Luis H  (player) -> 2222
--   Miguel  (player) -> 3333
--
-- Los pin_hash son bcrypt. Para regenerar usa:  npm run hash:pins
-- ===========================================================================

insert into public.users (name, role, pin_hash) values
  ('Daniel', 'admin',  '$2a$10$dRzC1KrbxjeoDpSUxz6rLOuriTJMqWHaRPFlb2QlRImpELK6IMnb6'),
  ('Camilo', 'player', '$2a$10$rIWR1YNGh3Lyxkd7wOSdNe65DZu3U7gAQtmw6E4Che47bHQZu8Sai'),
  ('Luis H', 'player', '$2a$10$JjONfInf9JFn.bPSZHc5GekA5PQd5YNaNae0BW1varrS4c59a7i1O'),
  ('Miguel', 'player', '$2a$10$U8wmWUhy8kpU7PhoJRc0U.ogLmbKGP7IG4gTZVxlai5jiO71kb3bi')
on conflict (name) do nothing;
