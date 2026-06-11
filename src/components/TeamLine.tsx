import { teamFlag } from "@/lib/teams";

/** Fila de un equipo con bandera y nombre. */
export function TeamLine({
  team,
  score,
  align = "left",
  bold = false,
}: {
  team: string;
  score?: number | null;
  align?: "left" | "right";
  bold?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 ${
        align === "right" ? "flex-row-reverse text-right" : ""
      }`}
    >
      <span className="text-2xl leading-none">{teamFlag(team)}</span>
      <span className={`text-sm ${bold ? "font-bold" : "font-medium"} truncate`}>{team}</span>
      {score !== undefined && score !== null && (
        <span className="ml-auto text-lg font-bold tabular-nums">{score}</span>
      )}
    </div>
  );
}
