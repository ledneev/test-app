import { MATCHES_URL } from '../config';
import type { Match, MatchesResponse, MatchStatus, Score, Team } from '../types/match';

const KNOWN_STATUSES: readonly string[] = ['scheduled', 'live', 'finished', 'postponed'];

export async function fetchMatches(signal?: AbortSignal): Promise<MatchesResponse> {
  const response = await fetch(MATCHES_URL, { signal, cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Сервер ответил ошибкой ${response.status}`);
  }
  const json: unknown = await response.json();
  return parseMatchesResponse(json);
}

// Приводит ответ сервера к нашим типам. Битые записи пропускаем,
// чтобы одна кривая запись не ломала весь список.
export function parseMatchesResponse(json: unknown): MatchesResponse {
  if (!isObject(json) || !Array.isArray(json.matches)) {
    throw new Error('Неожиданный формат ответа');
  }

  const seen = new Set<string>();
  const matches: Match[] = [];
  for (const raw of json.matches) {
    const match = parseMatch(raw);
    if (match && !seen.has(match.id)) {
      seen.add(match.id);
      matches.push(match);
    }
  }

  return {
    round: typeof json.round === 'number' ? json.round : null,
    matches: matches.sort(compareByStart),
  };
}

function parseMatch(raw: unknown): Match | null {
  if (!isObject(raw) || typeof raw.id !== 'string') return null;
  const home = parseTeam(raw.home);
  const away = parseTeam(raw.away);
  if (!home || !away) return null;

  return {
    id: raw.id,
    startsAt: parseDate(raw.startsAt),
    status: parseStatus(raw.status),
    minute: typeof raw.minute === 'number' ? raw.minute : null,
    home,
    away,
    score: parseScore(raw.score),
  };
}

function parseTeam(raw: unknown): Team | null {
  if (!isObject(raw) || typeof raw.id !== 'string' || typeof raw.name !== 'string') {
    return null;
  }
  return { id: raw.id, name: raw.name, city: typeof raw.city === 'string' ? raw.city : '' };
}

function parseScore(raw: unknown): Score | null {
  if (!isObject(raw) || typeof raw.home !== 'number' || typeof raw.away !== 'number') {
    return null;
  }
  return { home: raw.home, away: raw.away };
}

function parseDate(raw: unknown): Date | null {
  if (typeof raw !== 'string') return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseStatus(raw: unknown): MatchStatus {
  return typeof raw === 'string' && KNOWN_STATUSES.includes(raw) ? (raw as MatchStatus) : 'unknown';
}

// По времени начала; матчи без даты — в конце.
function compareByStart(a: Match, b: Match): number {
  if (!a.startsAt) return b.startsAt ? 1 : 0;
  if (!b.startsAt) return -1;
  return a.startsAt.getTime() - b.startsAt.getTime();
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
