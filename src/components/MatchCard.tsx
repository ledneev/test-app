import { StyleSheet, Text, View } from 'react-native';
import type { Match, Team } from '../types/match';
import { formatScore, formatStartsAt, statusLabel } from '../utils/matchFormat';
import { FavoriteButton } from './FavoriteButton';

type Props = {
  match: Match;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
};

export function MatchCard({ match, isFavorite, onToggleFavorite }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatStartsAt(match.startsAt)}</Text>
        <Text style={[styles.status, match.status === 'live' && styles.live]}>
          {statusLabel(match)}
        </Text>
        <FavoriteButton active={isFavorite} onPress={() => onToggleFavorite(match.id)} />
      </View>
      <View style={styles.teams}>
        <TeamName team={match.home} align="left" />
        <Text style={styles.score}>{formatScore(match)}</Text>
        <TeamName team={match.away} align="right" />
      </View>
    </View>
  );
}

function TeamName({ team, align }: { team: Team; align: 'left' | 'right' }) {
  return (
    <View style={styles.team}>
      <Text style={[styles.teamName, { textAlign: align }]} numberOfLines={2}>
        {team.name}
      </Text>
      {team.city ? (
        <Text style={[styles.city, { textAlign: align }]} numberOfLines={1}>
          {team.city}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  status: {
    fontSize: 13,
    color: '#6b7280',
  },
  live: {
    color: '#ef3124',
    fontWeight: '600',
  },
  teams: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  team: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
  },
  city: {
    fontSize: 12,
    color: '#9ca3af',
  },
  score: {
    fontSize: 20,
    fontWeight: '700',
    minWidth: 64,
    textAlign: 'center',
  },
});
