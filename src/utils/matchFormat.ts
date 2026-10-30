import type { Match, MatchStatus } from '../types/match';

export type MatchFilter = 'all' | 'upcoming' | 'finished';

export const FILTER_LABELS: Record<MatchFilter, string> = {
  all: 'Все',
  upcoming: 'Предстоящие',
  finished: 'Завершённые',
};

const STATUS_LABELS: Record<MatchStatus, string> = {
  scheduled: 'Запланирован',
  live: 'Идёт',
  finished: 'Завершён',
  postponed: 'Перенесён',
  unknown: 'Статус неизвестен',
};

export function statusLabel(match: Match): string {
  const label = STATUS_LABELS[match.status];
  return match.status === 'live' && match.minute !== null ? `${label} · ${match.minute}'` : label;
}

// Без явного timeZone toLocaleString использует часовой пояс устройства.
export function formatStartsAt(startsAt: Date | null): string {
  if (!startsAt) return 'Дата уточняется';
  return startsAt.toLocaleString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatScore(match: Match): string {
  return match.score ? `${match.score.home} : ${match.score.away}` : '– : –';
}

// Регистр и «ё» не важны: «цска», «Ахмат», «ахмат» — найдутся.
function normalize(text: string): string {
  return text.trim().toLocaleLowerCase('ru-RU').replace(/ё/g, 'е');
}

export function searchMatches(matches: Match[], query: string): Match[] {
  const needle = normalize(query);
  if (!needle) return matches;
  return matches.filter(
    (m) => normalize(m.home.name).includes(needle) || normalize(m.away.name).includes(needle),
  );
}

// Live и перенесённые ещё не сыграны — считаем их предстоящими.
// Неизвестные статусы видны только во «Все».
export function filterMatches(matches: Match[], filter: MatchFilter): Match[] {
  switch (filter) {
    case 'all':
      return matches;
    case 'upcoming':
      return matches.filter(
        (m) => m.status === 'scheduled' || m.status === 'live' || m.status === 'postponed',
      );
    case 'finished':
      return matches.filter((m) => m.status === 'finished');
  }
}
