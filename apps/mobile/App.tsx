import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎮 Classic Games</Text>
        <Text style={styles.subtitle}>Mobile Edition</Text>
      </View>

      {/* Game Selection */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <GameCard
          title="Poker"
          subtitle="Texas Hold'em"
          icon="🃏"
          available={true}
          onPress={() => console.log('Poker pressed')}
        />

        <GameCard
          title="Backgammon"
          subtitle="Classic Board Game"
          icon="🎲"
          available={false}
          onPress={() => console.log('Backgammon pressed')}
        />

        <GameCard
          title="Scrabble"
          subtitle="Word Game"
          icon="🔤"
          available={false}
          onPress={() => console.log('Scrabble pressed')}
        />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ✨ 3D Graphics • 🌐 Online Multiplayer • 🎮 Cross-Platform
        </Text>
      </View>
    </View>
  );
}

interface GameCardProps {
  title: string;
  subtitle: string;
  icon: string;
  available: boolean;
  onPress: () => void;
}

function GameCard({ title, subtitle, icon, available, onPress }: GameCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, !available && styles.cardDisabled]}
      onPress={available ? onPress : undefined}
      disabled={!available}
    >
      <Text style={styles.cardIcon}>{icon}</Text>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
      {!available && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Soon</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1F2E',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#1A1F2E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardDisabled: {
    opacity: 0.6,
  },
  cardIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  badge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1A1F2E',
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
  },
});
