/**
 * Carga los 72 partidos de `data/matches.json` en la tabla `matches` de Supabase.
 *
 * Uso:  npm run import:matches
 *
 * Requiere en .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Idempotente: hace upsert por match_number (puedes correrlo varias veces).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Carga manual de .env.local (sin dependencias extra).
function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* sin .env.local: se asume que las vars ya están en el entorno */
  }
}
loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

type MatchJson = {
  match_number: number;
  group_name: string;
  jornada: number;
  match_date: string;
  match_time: string;
  home_team: string;
  away_team: string;
  venue: string;
};

const matches: MatchJson[] = JSON.parse(
  readFileSync(resolve(process.cwd(), "data/matches.json"), "utf8")
);

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

async function main() {
  const rows = matches.map((m) => ({
    match_number: m.match_number,
    group_name: m.group_name,
    jornada: m.jornada,
    match_date: m.match_date,
    match_time: m.match_time,
    home_team: m.home_team,
    away_team: m.away_team,
    venue: m.venue || null,
    status: "scheduled" as const,
  }));

  const { error, count } = await supabase
    .from("matches")
    .upsert(rows, { onConflict: "match_number", count: "exact" });

  if (error) {
    console.error("Error al importar partidos:", error.message);
    process.exit(1);
  }
  console.log(`OK: ${count ?? rows.length} partidos importados/actualizados.`);
}

main();
