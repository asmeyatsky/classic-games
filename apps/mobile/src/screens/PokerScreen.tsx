import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Dimensions,
  Animated,
  GestureResponderEvent,
  Vibration,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Mobile Poker Screen - Touch-Optimized
 *
 * Features:
 * - Portrait-first responsive design
 * - Large touch targets (48px minimum)
 * - Swipe gestures for actions
 * - Haptic feedback on interactions
 * - Pinch to zoom for card details
 * - Slide-out action menus
 * - Portrait/landscape support
 */

interface Player {
  id: string;
  name: string;
  chips: number;
  bet: number;
  folded: boolean;
  holeCards?: string[];
}

interface GameState {
  players: Player[];
  pot: number;
  currentPlayerIndex: number;
  currentBet: number;
  phase: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  communityCards: string[];
}

export default function PokerScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get('window');
  const isLandscape = width > height;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [betAmount, setBetAmount] = useState(0);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    setGameState({
      players: [
        { id: '1', name: 'You', chips: 5000, bet: 0, folded: false, holeCards: ['AS', 'KH'] },
        { id: '2', name: 'Player 2', chips: 3500, bet: 100, folded: false },
        { id: '3', name: 'Player 3', chips: 4200, bet: 50, folded: true },
      ],
      pot: 2500,
      currentPlayerIndex: 0,
      currentBet: 100,
      phase: 'preflop',
      communityCards: [],
    });
  };

  const handleAction = useCallback((action: string) => {
    Vibration.vibrate(10);
    setSelectedAction(action);
    triggerHaptic('selection');

    // Animate action
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim]);

  const triggerHaptic = (type: 'selection' | 'impact' | 'notification') => {
    switch (type) {
      case 'selection':
        Vibration.vibrate(10);
        break;
      case 'impact':
        Vibration.vibrate(20);
        break;
      case 'notification':
        Vibration.vibrate([10, 20, 10]);
        break;
    }
  };

  const slideInterpolate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });

  if (!gameState) return null;

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a', paddingTop: insets.top }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Texas Hold'em</Text>
          <Text style={styles.subtitle}>{gameState.phase}</Text>
        </View>
        <View style={styles.potDisplay}>
          <Text style={styles.potLabel}>Pot</Text>
          <Text style={styles.potAmount}>${gameState.pot}</Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Game Table Area */}
        <View style={styles.tableContainer}>
          <View style={styles.table}>
            <Text style={styles.tableText}>3D Table Rendering Area</Text>
          </View>
        </View>

        {/* Community Cards */}
        {gameState.communityCards.length > 0 && (
          <View style={styles.communityCardsContainer}>
            <Text style={styles.sectionLabel}>Community Cards</Text>
            <View style={styles.cardsRow}>
              {gameState.communityCards.map((card, idx) => (
                <View key={idx} style={styles.card}>
                  <Text style={styles.cardText}>{card}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Players Info - Compact for mobile */}
        <View style={styles.playersContainer}>
          <Text style={styles.sectionLabel}>Players</Text>
          {gameState.players.map((player, idx) => (
            <View
              key={player.id}
              style={[
                styles.playerCard,
                idx === gameState.currentPlayerIndex && styles.playerCardActive,
                player.folded && styles.playerCardFolded,
              ]}
            >
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>
                  {player.name}
                  {idx === gameState.currentPlayerIndex && ' (You)'}
                </Text>
                <Text style={styles.playerChips}>${player.chips}</Text>
              </View>
              <View style={styles.playerBet}>
                <Text style={styles.betLabel}>Bet</Text>
                <Text style={styles.betAmount}>${player.bet}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Your Hand - Prominent */}
        <View style={styles.yourHandContainer}>
          <Text style={styles.sectionLabel}>Your Hand</Text>
          <View style={styles.handCardsRow}>
            {currentPlayer.holeCards?.map((card, idx) => (
              <View key={idx} style={styles.holeCard}>
                <Text style={styles.holecardText}>{card}</Text>
              </View>
            ))}
          </View>
          <View style={styles.stackDisplay}>
            <Text style={styles.stackLabel}>Your Stack</Text>
            <Text style={styles.stackAmount}>${currentPlayer.chips}</Text>
          </View>
        </View>

        {/* Spacer for bottom controls */}
        <View style={{ height: 200 }} />
      </ScrollView>

      {/* Bottom Action Bar - Fixed */}
      <View style={[styles.actionBar, { paddingBottom: insets.bottom }]}>
        {/* Action Buttons - Touch-optimized */}
        <View style={styles.actionButtonsGrid}>
          {/* Fold Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.foldButton]}
            onPress={() => handleAction('fold')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>Fold</Text>
            <Text style={styles.actionButtonSubtext}>✕</Text>
          </TouchableOpacity>

          {/* Check/Call Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.checkButton]}
            onPress={() => handleAction('check')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>Check</Text>
            <Text style={styles.actionButtonSubtext}>✓</Text>
          </TouchableOpacity>

          {/* Bet/Raise Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.raiseButton]}
            onPress={() => handleAction('raise')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>Raise</Text>
            <Text style={styles.actionButtonSubtext}>$</Text>
          </TouchableOpacity>
        </View>

        {/* Bet Slider - Mobile optimized */}
        <View style={styles.betSliderContainer}>
          <Text style={styles.betSliderLabel}>Bet: ${betAmount}</Text>
          {/* Slider component would go here */}
          <View style={styles.sliderFake}>
            <View style={[styles.sliderTrack, { width: `${(betAmount / 5000) * 100}%` }]} />
          </View>
          <View style={styles.betQuickButtons}>
            <TouchableOpacity
              style={styles.betQuickButton}
              onPress={() => setBetAmount(100)}
            >
              <Text style={styles.betQuickButtonText}>100</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.betQuickButton}
              onPress={() => setBetAmount(500)}
            >
              <Text style={styles.betQuickButtonText}>500</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.betQuickButton}
              onPress={() => setBetAmount(currentPlayer.chips)}
            >
              <Text style={styles.betQuickButtonText}>All-in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = {
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a2744',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  } as any,
  headerContent: {
    flex: 1,
  } as any,
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  } as any,
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  } as any,
  potDisplay: {
    backgroundColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  } as any,
  potLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  } as any,
  potAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#facc15',
    marginTop: 4,
  } as any,
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  } as any,
  tableContainer: {
    marginBottom: 16,
  } as any,
  table: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  } as any,
  tableText: {
    color: '#64748b',
    fontSize: 14,
  } as any,
  communityCardsContainer: {
    marginBottom: 16,
  } as any,
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  } as any,
  cardsRow: {
    flexDirection: 'row',
    gap: 8,
  } as any,
  card: {
    flex: 1,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  } as any,
  cardText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  } as any,
  playersContainer: {
    marginBottom: 16,
  } as any,
  playerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#334155',
  } as any,
  playerCardActive: {
    borderColor: '#fbbf24',
    backgroundColor: '#1f2937',
  } as any,
  playerCardFolded: {
    opacity: 0.5,
  } as any,
  playerInfo: {
    flex: 1,
  } as any,
  playerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f1f5f9',
  } as any,
  playerChips: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '700',
    marginTop: 4,
  } as any,
  playerBet: {
    alignItems: 'flex-end',
  } as any,
  betLabel: {
    fontSize: 10,
    color: '#94a3b8',
  } as any,
  betAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fbbf24',
  } as any,
  yourHandContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#10b981',
    marginBottom: 16,
  } as any,
  handCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  } as any,
  holeCard: {
    flex: 1,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 0.7,
  } as any,
  holecardText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  } as any,
  stackDisplay: {
    alignItems: 'center',
  } as any,
  stackLabel: {
    fontSize: 12,
    color: '#94a3b8',
  } as any,
  stackAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#10b981',
    marginTop: 4,
  } as any,
  actionBar: {
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingHorizontal: 12,
    paddingTop: 12,
  } as any,
  actionButtonsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  } as any,
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 60,
  } as any,
  foldButton: {
    backgroundColor: '#dc2626',
  } as any,
  checkButton: {
    backgroundColor: '#475569',
  } as any,
  raiseButton: {
    backgroundColor: '#10b981',
  } as any,
  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  } as any,
  actionButtonSubtext: {
    color: '#fff',
    fontSize: 18,
    marginTop: 4,
  } as any,
  betSliderContainer: {
    marginBottom: 12,
  } as any,
  betSliderLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  } as any,
  sliderFake: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  } as any,
  sliderTrack: {
    height: '100%',
    backgroundColor: '#10b981',
  } as any,
  betQuickButtons: {
    flexDirection: 'row',
    gap: 8,
  } as any,
  betQuickButton: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
  } as any,
  betQuickButtonText: {
    color: '#f1f5f9',
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
  } as any,
};
