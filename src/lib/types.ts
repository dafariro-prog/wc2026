export type Role = "admin" | "player";
export type MatchStatus = "scheduled" | "locked" | "finished";

export type User = {
  id: string;
  name: string;
  role: Role;
};

export type Match = {
  id: string;
  match_number: number;
  group_name: string;
  jornada: number | null;
  match_date: string; // YYYY-MM-DD
  match_time: string; // HH:MM:SS
  timezone: string;
  home_team: string;
  away_team: string;
  venue: string | null;
  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;
  points_calculated: boolean;
  kickoff_at: string; // ISO timestamptz
};

export type Prediction = {
  id: string;
  match_id: string;
  user_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  points_awarded: number;
  points_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type Standing = {
  user_id: string;
  name: string;
  total_points: number;
  exact_count: number;
  result_count: number;
  partial_count: number;
  predictions_count: number;
};

/** Sesión guardada en la cookie (payload del JWT). */
export type SessionUser = {
  id: string;
  name: string;
  role: Role;
};
