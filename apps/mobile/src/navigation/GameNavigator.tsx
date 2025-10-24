import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';

import PokerScreen from '../screens/PokerScreen';
import BackgammonScreen from '../screens/BackgammonScreen';
import ScrabbleScreen from '../screens/ScrabbleScreen';

/**
 * Mobile Game Navigator
 *
 * Navigation structure:
 * - Tab-based navigation for game selection
 * - Stack navigation for each game
 * - Game screens with independent state
 * - Bottom tab bar for easy switching
 */

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Poker Stack
function PokerStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen
        name="PokerGame"
        component={PokerScreen}
        options={{
          animationEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}

// Backgammon Stack
function BackgammonStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen
        name="BackgammonGame"
        component={BackgammonScreen}
        options={{
          animationEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}

// Scrabble Stack
function ScrabbleStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen
        name="ScrabbleGame"
        component={ScrabbleScreen}
        options={{
          animationEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}

// Lobby/Home Screen
function LobbyScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Games Lobby</Text>
      <Text style={{ color: '#94a3b8', fontSize: 14, marginTop: 8 }}>Select a game to play</Text>
    </View>
  );
}

// Main Tab Navigator
export function GameTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a2e',
          borderTopColor: '#334155',
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 4,
        },
        tabBarActiveTintColor: '#06b6d4',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Poker"
        component={PokerStack}
        options={{
          title: '🃏 Poker',
          tabBarLabel: 'Poker',
        }}
      />
      <Tab.Screen
        name="Backgammon"
        component={BackgammonStack}
        options={{
          title: '🎲 Backgammon',
          tabBarLabel: 'Backgammon',
        }}
      />
      <Tab.Screen
        name="Scrabble"
        component={ScrabbleStack}
        options={{
          title: '📝 Scrabble',
          tabBarLabel: 'Scrabble',
        }}
      />
      <Tab.Screen
        name="Lobby"
        component={LobbyScreen}
        options={{
          title: '🏠 Lobby',
          tabBarLabel: 'Lobby',
        }}
      />
    </Tab.Navigator>
  );
}

// Root Navigator
export function RootNavigator() {
  return (
    <NavigationContainer>
      <GameTabNavigator />
    </NavigationContainer>
  );
}
