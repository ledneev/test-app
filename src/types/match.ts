export type KnownStatus = 'scheduled' | 'live' | 'finished' | 'postponed';

// 'unknown' — сервер прислал статус, о котором приложение не знает.
export type MatchStatus = KnownStatus | 'unknown';

export type Team = {
  id: string;
  name: string;
  city: string;
};

export type Score = {
  home: number;
  away: number;
};

export type Match = {
  id: string;
  // null — дата не назначена или пришла в невалидном формате.
  startsAt: Date | null;
  status: MatchStatus;
  // Минута матча, есть только у идущих матчей.
  minute: number | null;
  home: Team;
  away: Team;
  score: Score | null;
};

export type MatchesResponse = {
  round: number | null;
  matches: Match[];
};
