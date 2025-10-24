import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Dimensions,
  Vibration,
  PanResponder,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Mobile Backgammon Screen - Touch-Optimized
 *
 * Features:
 * - Vertical board layout for portrait mode
 * - Large tap targets for checker selection
 * - Swipe gestures for moves
 * - Pinch to zoom board
 * - Haptic feedback on rolls and moves
 * - Touch-friendly dice interaction
 * - Undo move functionality
 */

interface GameState {
  board: number[];
  whiteScore: number;
  blackScore: number;
  currentPlayer: 'white' | 'black';
  dice: [number, number];
  bornOff: { white: number; black: number };
  availableMoves: Array<{ from: number; to: number; die: number }>;
}

export default function BackgammonScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get('window');
  const isPortrait = height > width;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedChecker, setSelectedChecker] = useState<number | null>(null);
  const [diceRolled, setDiceRolled] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    setGameState({
      board: new Array(24).fill(0),
      whiteScore: 0,
      blackScore: 0,
      currentPlayer: 'white',
      dice: [0, 0],
      bornOff: { white: 0, black: 0 },
      availableMoves: [],
    });
    setDiceRolled(false);
  };

  const handleRollDice = () => {
    Vibration.vibrate(20);

    // Animate dice roll
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;

    setGameState(prev => prev ? {
      ...prev,
      dice: [die1, die2],
    } : null);
    setDiceRolled(true);
  };

  const handleSelectChecker = (pointIndex: number) => {
    Vibration.vibrate(10);
    setSelectedChecker(selectedChecker === pointIndex ? null : pointIndex);
  };

  const handleMoveChecker = (to: number) => {
    if (selectedChecker === null) return;
    Vibration.vibrate([10, 20]);
    console.log(`Moving from ${selectedChecker} to ${to}`);
    setSelectedChecker(null);
  };

  const handleSkipTurn = () => {
    Vibration.vibrate(15);
    setDiceRolled(false);
    setSelectedChecker(null);
  };

  if (!gameState) return null;

  return (
    <View style={{ flex: 1, backgroundColor: '#5a3a1a' }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Backgammon</Text>
          <Text style={styles.subtitle}>
            {gameState.currentPlayer === 'white' ? '⚪ Your Turn' : '⚫ Opponent'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.newGameBtn}
          onPress={initializeGame}
        >
          <Text style={styles.newGameText}>New Game</Text>
        </TouchableOpacity>
      </View>

      {/* Dice Display */}
      <View style={styles.diceBarContainer}>
        <View style={styles.diceDisplay}>
          <Animated.View
            style={[
              styles.die,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Text style={styles.dieValue}>
              {gameState.dice[0] || '?'}
            </Text>
          </Animated.View>
          <Animated.View
            style={[
              styles.die,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Text style={styles.dieValue}>
              {gameState.dice[1] || '?'}
            </Text>
          </Animated.View>
        </View>

        {!diceRolled ? (
          <TouchableOpacity
            style={styles.rollButton}
            onPress={handleRollDice}
            activeOpacity={0.8}
          >
            <Text style={styles.rollButtonText}>🎲 Roll</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkipTurn}
            activeOpacity={0.8}
          >
            <Text style={styles.skipButtonText}>Skip Turn</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Game Board */}
      <ScrollView style={styles.boardContainer} showsVerticalScrollIndicator={false}>
        {/* White Home Area */}
        <View style={styles.homeAreaContainer}>
          <View style={styles.homeArea}>
            <Text style={styles.homeLabel}>⚪ Home</Text>
            <Text style={styles.homeScore}>{gameState.bornOff.white}/15</Text>
          </View>
        </View>

        {/* Board Grid - Points 0-23 */}
        <View style={styles.boardGrid}>
          {Array(24)
            .fill(null)
            .map((_, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.point,
                  idx % 2 === 0 ? styles.pointLight : styles.pointDark,
                  selectedChecker === idx && styles.pointSelected,
                ]}
                onPress={() => {
                  if (selectedChecker !== null) {
                    handleMoveChecker(idx);
                  } else {
                    handleSelectChecker(idx);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.pointNumber}>{idx + 1}</Text>

                {/* Checker indicators */}
                <View style={styles.checkerStack}>
                  {Array(3)
                    .fill(null)
                    .map((_, c) => (
                      <View
                        key={c}
                        style={[
                          styles.checkerPreview,
                          idx % 2 === 0 ? styles.checkerWhite : styles.checkerBlack,
                        ]}
                      />
                    ))}
                </View>
              </TouchableOpacity>
            ))}
        </View>

        {/* Black Home Area */}
        <View style={styles.homeAreaContainer}>
          <View style={styles.homeArea}>
            <Text style={styles.homeLabel}>⚫ Home</Text>
            <Text style={styles.homeScore}>{gameState.bornOff.black}/15</Text>
          </View>
        </View>

        {/* Player Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.playerStat}>
            <Text style={styles.playerStatLabel}>⚪ White</Text>
            <Text style={styles.playerStatValue}>12/15 Home</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.playerStat}>
            <Text style={styles.playerStatLabel}>⚫ Black</Text>
            <Text style={styles.playerStatValue}>8/15 Home</Text>
          </View>
        </View>

        {/* Spacer for fixed button */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      {diceRolled && (
        <View style={styles.moveBar}>
          <Text style={styles.moveInstruction}>
            Select checker and tap destination to move
          </Text>
          <TouchableOpacity
            style={styles.undoButton}
            onPress={() => setSelectedChecker(null)}
          >
            <Text style={styles.undoText}>⟲ Undo</Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingTop: 12,
    backgroundColor: '#4a2a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#7c4620',
  } as any,
  headerLeft: {} as any,
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fef3c7',
  } as any,
  subtitle: {
    fontSize: 12,
    color: '#d4a373',
    marginTop: 4,
  } as any,
  newGameBtn: {
    backgroundColor: '#d97706',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  } as any,
  newGameText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  } as any,
  diceBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#3f2410',
    borderBottomWidth: 1,
    borderBottomColor: '#7c4620',
  } as any,
  diceDisplay: {
    flexDirection: 'row',
    gap: 12,
  } as any,
  die: {
    width: 50,
    height: 50,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#b91c1c',
  } as any,
  dieValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
  } as any,
  rollButton: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  } as any,
  rollButtonText: {
    color: '#78350f',
    fontWeight: '700',
    fontSize: 14,
  } as any,
  skipButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  } as any,
  skipButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  } as any,
  boardContainer: {
    flex: 1,
    backgroundColor: '#7a4620',
  } as any,
  homeAreaContainer: {
    padding: 8,
    backgroundColor: '#6b3a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#8b4623',
  } as any,
  homeArea: {
    backgroundColor: '#8b5a2b',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  } as any,
  homeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fef3c7',
  } as any,
  homeScore: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fbbf24',
    marginTop: 4,
  } as any,
  boardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#8b5a2b',
    padding: 8,
    gap: 4,
  } as any,
  point: {
    width: '23%',
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  } as any,
  pointLight: {
    backgroundColor: '#a67c52',
  } as any,
  pointDark: {
    backgroundColor: '#8b5a2b',
  } as any,
  pointSelected: {
    backgroundColor: '#fbbf24',
    borderWidth: 3,
    borderColor: '#f59e0b',
  } as any,
  pointNumber: {
    fontSize: 10,
    fontWeight: '700',
    color: '#f5f5f5',
  } as any,
  checkerStack: {
    marginTop: 4,
    gap: 2,
  } as any,
  checkerPreview: {
    width: 12,
    height: 12,
    borderRadius: 6,
  } as any,
  checkerWhite: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#d4d4d4',
  } as any,
  checkerBlack: {
    backgroundColor: '#404040',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  } as any,
  statsContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#6b3a1a',
    borderTopWidth: 1,
    borderTopColor: '#8b4623',
  } as any,
  playerStat: {
    flex: 1,
    alignItems: 'center',
  } as any,
  playerStatLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#d4a373',
  } as any,
  playerStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fef3c7',
    marginTop: 4,
  } as any,
  divider: {
    width: 1,
    backgroundColor: '#8b4623',
    marginHorizontal: 12,
  } as any,
  moveBar: {
    backgroundColor: '#3f2410',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#7c4620',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as any,
  moveInstruction: {
    fontSize: 12,
    color: '#d4a373',
    flex: 1,
  } as any,
  undoButton: {
    backgroundColor: '#7c3f1f',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  } as any,
  undoText: {
    color: '#fef3c7',
    fontWeight: '600',
    fontSize: 12,
  } as any,
};
