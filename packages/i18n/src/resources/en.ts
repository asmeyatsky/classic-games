/**
 * English (en) Translations
 */

export const en = {
  // Common UI
  common: {
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    settings: 'Settings',
    logout: 'Logout',
    language: 'Language',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    profile: 'Profile',
  },

  // Navigation
  nav: {
    home: 'Home',
    games: 'Games',
    poker: 'Poker',
    backgammon: 'Backgammon',
    scrabble: 'Scrabble',
    leaderboard: 'Leaderboard',
    statistics: 'Statistics',
    settings: 'Settings',
    about: 'About',
    contact: 'Contact',
  },

  // Poker
  poker: {
    title: "Texas Hold'em Poker",
    subtitle: 'Play classic poker against AI opponents',
    description:
      "Experience authentic Texas Hold'em poker with realistic gameplay and strategic AI opponents.",

    actions: {
      fold: 'Fold',
      check: 'Check',
      call: 'Call',
      raise: 'Raise',
      bet: 'Bet',
      allIn: 'All In',
      newHand: 'New Hand',
    },

    gamePhases: {
      preflop: 'Preflop - Initial Betting',
      flop: 'Flop - 3 Community Cards',
      turn: 'Turn - 4th Card',
      river: 'River - Final Card',
      showdown: 'Showdown',
    },

    status: {
      yourTurn: 'Your turn to act',
      folded: 'You have folded',
      allIn: 'All in!',
      winner: 'You won the hand!',
      loser: 'You lost the hand',
      bust: 'You are bust',
      handStrength: 'Hand Strength',
    },

    ui: {
      pot: 'Pot',
      stack: 'Stack',
      bet: 'Bet',
      minBet: 'Min Bet',
      yourHand: 'Your Hand',
      communityCards: 'Community Cards',
      players: 'Players',
      dealer: 'Dealer',
      smallBlind: 'Small Blind',
      bigBlind: 'Big Blind',
      table: 'Poker Table',
    },

    difficulty: {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      expert: 'Expert',
    },
  },

  // Backgammon
  backgammon: {
    title: 'Backgammon',
    subtitle: 'Play the ancient game of strategy',
    description:
      'Master the classic game of Backgammon with intelligent AI and beautiful 3D graphics.',

    actions: {
      rollDice: 'Roll Dice',
      moveChecker: 'Move Checker',
      bearOff: 'Bear Off',
      pass: 'Pass',
      undo: 'Undo',
      newGame: 'New Game',
    },

    status: {
      rolling: 'Rolling dice...',
      yourTurn: 'Your turn',
      mustMoveChecker: 'You must move your checkers',
      checkerHome: '{{count}} checkers home',
      checkerBorne: '{{count}} checkers borne off',
      doubling: 'Doubling cube offered',
      winner: 'You won!',
    },

    ui: {
      board: 'Backgammon Board',
      whiteCheckers: 'White Checkers',
      redCheckers: 'Red Checkers',
      dice: 'Dice',
      bar: 'Bar',
      home: 'Home',
      pip: 'Pip Count',
    },

    difficulty: {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      expert: 'Expert',
    },
  },

  // Scrabble
  scrabble: {
    title: 'Scrabble',
    subtitle: 'Challenge your vocabulary',
    description:
      'Play Scrabble against intelligent AI opponents. Expand your vocabulary and test your spelling skills.',

    actions: {
      playWord: 'Play Word',
      challenge: 'Challenge',
      swap: 'Swap Tiles',
      pass: 'Pass',
      hint: 'Hint',
      newGame: 'New Game',
    },

    status: {
      validWord: 'Valid word!',
      invalidWord: 'Invalid word',
      notInDictionary: 'Word not in dictionary',
      turnSkipped: 'Turn skipped',
      gameOver: 'Game over',
      winner: 'You won!',
      draw: "It's a draw",
    },

    ui: {
      board: 'Scrabble Board',
      tiles: 'Tiles',
      rack: 'Rack',
      score: 'Score',
      word: 'Word',
      points: 'Points',
      remaining: 'Tiles Remaining',
    },

    difficulty: {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      expert: 'Expert',
    },
  },

  // Game UI
  game: {
    player: 'Player',
    opponent: 'Opponent',
    score: 'Score',
    round: 'Round',
    level: 'Level',
    lives: 'Lives',
    time: 'Time',
    moves: 'Moves',
    hint: 'Hint',
    hints: 'Hints: {{count}}',
    pause: 'Pause',
    resume: 'Resume',
    quit: 'Quit Game',
    confirmQuit: 'Are you sure you want to quit?',
  },

  // Audio & Settings
  audio: {
    master: 'Master Volume',
    music: 'Music Volume',
    sfx: 'Sound Effects Volume',
    ambient: 'Ambient Volume',
    musicEnabled: 'Music Enabled',
    sfxEnabled: 'Sound Effects Enabled',
    hapticsEnabled: 'Haptics Enabled',
    mute: 'Mute',
    unmute: 'Unmute',
  },

  // Statistics
  stats: {
    totalGames: 'Total Games',
    wins: 'Wins',
    losses: 'Losses',
    winRate: 'Win Rate',
    averageScore: 'Average Score',
    bestScore: 'Best Score',
    totalPoints: 'Total Points',
    streak: 'Current Streak',
    gamesPlayed: 'Games Played',
  },

  // Messages
  messages: {
    welcome: 'Welcome to Classic Games!',
    loading: 'Loading game...',
    connectingServer: 'Connecting to server...',
    connectionError: 'Connection error. Please try again.',
    sessionExpired: 'Your session has expired. Please log in again.',
    errorOccurred: 'An error occurred: {{error}}',
    successMessage: '{{message}}',
    confirmAction: 'Are you sure?',
  },

  // Months and Days
  months: {
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',
  },

  days: {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  },
};
