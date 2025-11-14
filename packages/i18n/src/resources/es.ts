/**
 * Spanish (es) Translations
 */

export const es = {
  // Common UI
  common: {
    yes: 'Sí',
    no: 'No',
    ok: 'Aceptar',
    cancel: 'Cancelar',
    save: 'Guardar',
    close: 'Cerrar',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    warning: 'Advertencia',
    info: 'Información',
    settings: 'Configuración',
    logout: 'Cerrar sesión',
    language: 'Idioma',
    darkMode: 'Modo Oscuro',
    lightMode: 'Modo Claro',
    profile: 'Perfil',
  },

  // Navigation
  nav: {
    home: 'Inicio',
    games: 'Juegos',
    poker: 'Póker',
    backgammon: 'Backgammon',
    scrabble: 'Scrabble',
    leaderboard: 'Clasificación',
    statistics: 'Estadísticas',
    settings: 'Configuración',
    about: 'Acerca de',
    contact: 'Contacto',
  },

  // Poker
  poker: {
    title: "Póker Texas Hold'em",
    subtitle: 'Juega póker clásico contra oponentes de IA',
    description:
      "Experimenta el auténtico póker Texas Hold'em con jugabilidad realista y oponentes de IA estratégicos.",

    actions: {
      fold: 'Retirarse',
      check: 'Pasar',
      call: 'Seguir',
      raise: 'Subir',
      bet: 'Apostar',
      allIn: 'Ir de todo',
      newHand: 'Mano Nueva',
    },

    gamePhases: {
      preflop: 'Preflop - Apuesta Inicial',
      flop: 'Flop - 3 Cartas Comunitarias',
      turn: 'Turn - 4ª Carta',
      river: 'River - Carta Final',
      showdown: 'Showdown',
    },

    status: {
      yourTurn: 'Tu turno',
      folded: 'Te has retirado',
      allIn: '¡Todo de una!',
      winner: '¡Ganaste la mano!',
      loser: 'Perdiste la mano',
      bust: 'Te has reventado',
      handStrength: 'Fortaleza de la Mano',
    },

    ui: {
      pot: 'Bote',
      stack: 'Pila',
      bet: 'Apuesta',
      minBet: 'Apuesta Mínima',
      yourHand: 'Tu Mano',
      communityCards: 'Cartas Comunitarias',
      players: 'Jugadores',
      dealer: 'Repartidor',
      smallBlind: 'Ciega Pequeña',
      bigBlind: 'Ciega Grande',
      table: 'Mesa de Póker',
    },

    difficulty: {
      easy: 'Fácil',
      medium: 'Medio',
      hard: 'Difícil',
      expert: 'Experto',
    },
  },

  // Backgammon
  backgammon: {
    title: 'Backgammon',
    subtitle: 'Juega el antiguo juego de estrategia',
    description:
      'Domina el juego clásico del Backgammon con IA inteligente y hermosos gráficos 3D.',

    actions: {
      rollDice: 'Lanzar Dados',
      moveChecker: 'Mover Ficha',
      bearOff: 'Sacar Fichas',
      pass: 'Pasar',
      undo: 'Deshacer',
      newGame: 'Nuevo Juego',
    },

    status: {
      rolling: 'Lanzando dados...',
      yourTurn: 'Tu turno',
      mustMoveChecker: 'Debes mover tus fichas',
      checkerHome: '{{count}} fichas en casa',
      checkerBorne: '{{count}} fichas sacadas',
      doubling: 'Cubo de duplicación ofrecido',
      winner: '¡Ganaste!',
    },

    ui: {
      board: 'Tablero de Backgammon',
      whiteCheckers: 'Fichas Blancas',
      redCheckers: 'Fichas Rojas',
      dice: 'Dados',
      bar: 'Barra',
      home: 'Casa',
      pip: 'Cuenta de Pips',
    },

    difficulty: {
      easy: 'Fácil',
      medium: 'Medio',
      hard: 'Difícil',
      expert: 'Experto',
    },
  },

  // Scrabble
  scrabble: {
    title: 'Scrabble',
    subtitle: 'Desafía tu vocabulario',
    description:
      'Juega Scrabble contra oponentes de IA inteligentes. Expande tu vocabulario y pon a prueba tus habilidades de ortografía.',

    actions: {
      playWord: 'Jugar Palabra',
      challenge: 'Desafiar',
      swap: 'Intercambiar Fichas',
      pass: 'Pasar',
      hint: 'Pista',
      newGame: 'Nuevo Juego',
    },

    status: {
      validWord: '¡Palabra válida!',
      invalidWord: 'Palabra inválida',
      notInDictionary: 'Palabra no en diccionario',
      turnSkipped: 'Turno saltado',
      gameOver: 'Fin del juego',
      winner: '¡Ganaste!',
      draw: 'Es un empate',
    },

    ui: {
      board: 'Tablero de Scrabble',
      tiles: 'Fichas',
      rack: 'Atril',
      score: 'Puntuación',
      word: 'Palabra',
      points: 'Puntos',
      remaining: 'Fichas Restantes',
    },

    difficulty: {
      easy: 'Fácil',
      medium: 'Medio',
      hard: 'Difícil',
      expert: 'Experto',
    },
  },

  // Game UI
  game: {
    player: 'Jugador',
    opponent: 'Oponente',
    score: 'Puntuación',
    round: 'Ronda',
    level: 'Nivel',
    lives: 'Vidas',
    time: 'Tiempo',
    moves: 'Movimientos',
    hint: 'Pista',
    hints: 'Pistas: {{count}}',
    pause: 'Pausa',
    resume: 'Reanudar',
    quit: 'Salir del Juego',
    confirmQuit: '¿Seguro que quieres salir?',
  },

  // Audio & Settings
  audio: {
    master: 'Volumen Principal',
    music: 'Volumen de Música',
    sfx: 'Volumen de Efectos',
    ambient: 'Volumen Ambiental',
    musicEnabled: 'Música Habilitada',
    sfxEnabled: 'Efectos Habilitados',
    hapticsEnabled: 'Háptica Habilitada',
    mute: 'Silenciar',
    unmute: 'Activar Sonido',
  },

  // Statistics
  stats: {
    totalGames: 'Juegos Totales',
    wins: 'Victorias',
    losses: 'Derrotas',
    winRate: 'Tasa de Victoria',
    averageScore: 'Puntuación Promedio',
    bestScore: 'Mejor Puntuación',
    totalPoints: 'Puntos Totales',
    streak: 'Racha Actual',
    gamesPlayed: 'Juegos Jugados',
  },

  // Messages
  messages: {
    welcome: '¡Bienvenido a Juegos Clásicos!',
    loading: 'Cargando juego...',
    connectingServer: 'Conectando con el servidor...',
    connectionError: 'Error de conexión. Por favor, intenta de nuevo.',
    sessionExpired: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.',
    errorOccurred: 'Ocurrió un error: {{error}}',
    successMessage: '{{message}}',
    confirmAction: '¿Estás seguro?',
  },

  // Months and Days
  months: {
    january: 'Enero',
    february: 'Febrero',
    march: 'Marzo',
    april: 'Abril',
    may: 'Mayo',
    june: 'Junio',
    july: 'Julio',
    august: 'Agosto',
    september: 'Septiembre',
    october: 'Octubre',
    november: 'Noviembre',
    december: 'Diciembre',
  },

  days: {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo',
  },
};
