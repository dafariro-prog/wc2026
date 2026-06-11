/**
 * Convierte `calendario_mundial_2026_grupos.xlsx` -> `data/matches.json`.
 *
 * Uso:  npm run gen:matches
 *
 * Lee la hoja "Calendario" y normaliza horas a formato 24h (America/Bogota).
 * Solo depende de `xlsx` (devDependency).
 */
import * as XLSX from "xlsx";
import { writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// Ubicaciones posibles del Excel (ajusta si lo tienes en otra ruta).
const CANDIDATES = [
  resolve(process.cwd(), "calendario_mundial_2026_grupos.xlsx"),
  resolve(process.cwd(), "data/calendario_mundial_2026_grupos.xlsx"),
  resolve(process.cwd(), "../Downloads/calendario_mundial_2026_grupos.xlsx"),
];

const xlsxPath = CANDIDATES.find((p) => existsSync(p));
if (!xlsxPath) {
  console.error(
    "No se encontró calendario_mundial_2026_grupos.xlsx. Colócalo en la raíz del proyecto."
  );
  process.exit(1);
}

/** '2:00 PM' -> '14:00' */
function to24h(t: string): string {
  const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return t;
  let h = Number(m[1]) % 12;
  if (/PM/i.test(m[3])) h += 12;
  return `${String(h).padStart(2, "0")}:${m[2]}`;
}

type RawRow = (string | undefined)[];

const wb = XLSX.readFile(xlsxPath);
const ws = wb.Sheets["Calendario"];
const rows = (XLSX.utils.sheet_to_json(ws, { header: 1, raw: false }) as RawRow[])
  .slice(1) // saltar encabezados
  .filter((r) => r[0]); // solo filas con número de partido

const matches = rows.map((r) => ({
  match_number: Number(r[0]),
  group_name: r[1],
  jornada: Number(r[2]),
  match_date: r[5], // Fecha Colombia (YYYY-MM-DD)
  match_time: to24h(String(r[6] ?? "")), // Hora Colombia 24h
  home_team: r[7],
  away_team: r[8],
  venue: [r[10], r[11]].filter(Boolean).join(" - "),
}));

const outPath = resolve(process.cwd(), "data/matches.json");
writeFileSync(outPath, JSON.stringify(matches, null, 2), "utf8");
console.log(`OK: ${matches.length} partidos -> ${outPath}`);
