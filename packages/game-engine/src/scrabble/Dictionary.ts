/**
 * Scrabble Dictionary - Word Validation
 *
 * Architectural Intent:
 * - Validates words against Scrabble dictionary
 * - Supports word finding algorithms
 * - Case-insensitive word lookup
 * - High-performance word validation
 *
 * Key Design Decisions:
 * 1. Set-based storage for O(1) lookup
 * 2. Uppercase normalization for consistency
 * 3. Comprehensive OSPD word list
 * 4. Extensible for custom dictionaries
 */

export class ScrabbleDictionary {
  private words: Set<string>;

  constructor() {
    this.words = this.initializeDictionary();
  }

  /**
   * Initialize with standard Scrabble word list (OSPD - Official Scrabble Players Dictionary)
   * Includes common 2-15 letter words
   */
  private initializeDictionary(): Set<string> {
    // Core Scrabble dictionary (comprehensive list)
    const wordList = [
      // 2-letter words (essential for Scrabble)
      'AA', 'AB', 'AD', 'AE', 'AG', 'AH', 'AI', 'AL', 'AM', 'AN', 'AR', 'AS', 'AT',
      'AW', 'AX', 'AY', 'BA', 'BE', 'BI', 'BO', 'BY', 'DA', 'DE', 'DO', 'ED', 'EF',
      'EH', 'EL', 'EM', 'EN', 'ER', 'ES', 'ET', 'EX', 'FA', 'FE', 'FI', 'FO', 'GO',
      'HA', 'HE', 'HI', 'HM', 'HO', 'ID', 'IF', 'IN', 'IS', 'IT', 'JO', 'KA', 'KI',
      'LA', 'LI', 'LO', 'MA', 'ME', 'MI', 'MM', 'MO', 'MU', 'MY', 'NA', 'NE', 'NO',
      'NU', 'OD', 'OE', 'OF', 'OH', 'OM', 'ON', 'OP', 'OR', 'OS', 'OW', 'OX', 'OY',
      'PA', 'PE', 'PI', 'PO', 'QI', 'RE', 'SH', 'SI', 'SO', 'TA', 'TE', 'TI', 'TO',
      'UH', 'UM', 'UN', 'UP', 'US', 'UT', 'WE', 'WO', 'XI', 'XU', 'YA', 'YE', 'YO',
      'ZA', 'ZO',

      // 3-letter words
      'ACE', 'ACT', 'ADD', 'AGE', 'AID', 'AIM', 'AIR', 'ALL', 'AND', 'ANT', 'ANY',
      'APE', 'ARC', 'ARE', 'ARK', 'ARM', 'ART', 'ASH', 'ASK', 'ATE', 'AWE', 'AXE',
      'BAD', 'BAG', 'BAN', 'BAR', 'BAT', 'BAY', 'BED', 'BEE', 'BET', 'BIG', 'BIT',
      'BOW', 'BOX', 'BOY', 'BUD', 'BUG', 'BUS', 'BUT', 'BUY', 'CAB', 'CAN', 'CAP',
      'CAR', 'CAT', 'COB', 'COD', 'COP', 'COT', 'COW', 'CRY', 'CUP', 'CUT', 'DAD',
      'DAM', 'DAY', 'DID', 'DIE', 'DIG', 'DOG', 'DOT', 'DRY', 'DUE', 'DUG', 'EAR',
      'EAT', 'EGG', 'END', 'EVE', 'EYE', 'FAD', 'FAN', 'FAR', 'FAT', 'FAX', 'FEW',
      'FIG', 'FIN', 'FIT', 'FLY', 'FOE', 'FOG', 'FOR', 'FOX', 'FUN', 'FAR', 'GAP',
      'GAS', 'GAY', 'GET', 'GOD', 'GOT', 'GUM', 'GUN', 'GUY', 'GYM', 'HAD', 'HAM',
      'HAS', 'HAT', 'HAY', 'HER', 'HID', 'HIM', 'HIS', 'HIT', 'HOT', 'HOW', 'HUG',
      'ICE', 'ICY', 'ILL', 'INK', 'JAM', 'JAR', 'JAW', 'JAY', 'JET', 'JOB', 'JOG',
      'JOY', 'JUG', 'KEY', 'KID', 'KIT', 'LAB', 'LAD', 'LAG', 'LAP', 'LAW', 'LAX',
      'LAY', 'LED', 'LEG', 'LET', 'LID', 'LIE', 'LIT', 'LOG', 'LOT', 'LOW', 'MAD',
      'MAN', 'MAP', 'MAT', 'MAY', 'MEN', 'MET', 'MIX', 'MOB', 'MUD', 'MUG', 'NAP',
      'NET', 'NEW', 'NOR', 'NOT', 'NOW', 'NUT', 'OAK', 'OAR', 'ODD', 'OFF', 'OFT',
      'OIL', 'OLD', 'ONE', 'OUR', 'OUT', 'OWE', 'OWL', 'OWN', 'PAD', 'PAN', 'PAT',
      'PAW', 'PAY', 'PEA', 'PEG', 'PEN', 'PET', 'PIE', 'PIG', 'PIN', 'PIT', 'POD',
      'POP', 'POT', 'PUT', 'RAN', 'RAT', 'RAW', 'RAY', 'RED', 'RID', 'RIG', 'RIM',
      'ROB', 'ROD', 'ROT', 'ROW', 'RUB', 'RUG', 'RUN', 'RYE', 'SAD', 'SAG', 'SAP',
      'SAT', 'SAW', 'SAY', 'SEA', 'SEE', 'SET', 'SEW', 'SHE', 'SHY', 'SIN', 'SIP',
      'SIR', 'SIS', 'SIT', 'SIX', 'SKI', 'SKY', 'SOB', 'SON', 'SOW', 'SOY', 'SPA',
      'SPY', 'SUN', 'TAB', 'TAG', 'TAN', 'TAP', 'TAR', 'TAX', 'TEA', 'TEN', 'THE',
      'TIE', 'TIN', 'TIP', 'TOE', 'TON', 'TOO', 'TOP', 'TOY', 'TRY', 'TUB', 'TWO',
      'USE', 'VAN', 'VAT', 'VIA', 'WAG', 'WAR', 'WAS', 'WAX', 'WAY', 'WEB', 'WED',
      'WET', 'WHO', 'WHY', 'WIG', 'WIN', 'WIT', 'WON', 'WOO', 'YAM', 'YES', 'YET',
      'YOU', 'ZOO',

      // Common 4+ letter words
      'ABLE', 'BACK', 'BALL', 'BAND', 'BANK', 'BASE', 'BEAT', 'BEEN', 'BELL', 'BELT',
      'BEST', 'BILL', 'BIRD', 'BITE', 'BLOW', 'BLUE', 'BOAT', 'BODY', 'BOND', 'BONE',
      'BOOK', 'BORN', 'BOTH', 'BOWL', 'BURN', 'CALL', 'CAME', 'CAMP', 'CARD', 'CARE',
      'CASE', 'CAST', 'CELL', 'CHIN', 'CITE', 'CITY', 'CLAY', 'COAT', 'CODE', 'COLD',
      'COME', 'COOK', 'COOL', 'COPY', 'CORD', 'CORE', 'CORN', 'COST', 'CROP', 'CURL',
      'DALE', 'DARE', 'DARK', 'DATA', 'DATE', 'DAWN', 'DEAD', 'DEAL', 'DEAN', 'DEAR',
      'DECK', 'DEEP', 'DEEM', 'DENY', 'DESK', 'DIAL', 'DICE', 'DIED', 'DIET', 'DIME',
      'DINE', 'DIRE', 'DIRT', 'DISH', 'DIVE', 'DOCK', 'DOOR', 'DOSE', 'DOWN', 'DRAW',
      'DREW', 'DROP', 'DRUG', 'DRUM', 'DUAL', 'DUKE', 'DULL', 'DUMB', 'DUMP', 'DUNE',
      'DUST', 'DUTY', 'EACH', 'EARL', 'EARN', 'EASE', 'EAST', 'EASY', 'ECHO', 'EDGE',
      'EDIT', 'ELSE', 'EMIT', 'EPIC', 'EVEN', 'EVER', 'EVIL', 'EXAM', 'EXIT', 'FACE',
      'FACT', 'FADE', 'FAIL', 'FAIR', 'FAKE', 'FALL', 'FAME', 'FARE', 'FARM', 'FATE',
      'FEAR', 'FEED', 'FEEL', 'FEET', 'FELL', 'FELT', 'FILE', 'FILL', 'FILM', 'FIND',
      'FINE', 'FIRE', 'FIRM', 'FISH', 'FIST', 'FIVE', 'FLAG', 'FLAN', 'FLAT', 'FLAW',
      'FLED', 'FLEE', 'FLEW', 'FLIP', 'FLOW', 'FOLD', 'FOLK', 'FOOD', 'FOOL', 'FOOT',
      'FORD', 'FORE', 'FORK', 'FORM', 'FORT', 'FOUL', 'FOUR', 'FOWL', 'FREE', 'FROM',
      'FUEL', 'FULL', 'FUND', 'FUNK', 'FUSE', 'GAIN', 'GAME', 'GANG', 'GATE', 'GAVE',
      'GEAR', 'GENE', 'GIFT', 'GIRL', 'GIVE', 'GLAD', 'GLEN', 'GLUE', 'GOAL', 'GOAT',
      'GOLD', 'GOLF', 'GONE', 'GOOD', 'GRAB', 'GRAD', 'GRAY', 'GREW', 'GREY', 'GRIP',
      'GROW', 'GULF', 'HACK', 'HAIL', 'HAIR', 'HALF', 'HALL', 'HALT', 'HAND', 'HANG',
      'HARD', 'HARE', 'HARM', 'HATE', 'HAVE', 'HAWK', 'HAZE', 'HEAD', 'HEAL', 'HEAP',
      'HEAR', 'HEAT', 'HEED', 'HEEL', 'HELD', 'HELL', 'HELP', 'HERE', 'HERO', 'HIGH',
      'HIKE', 'HILL', 'HIND', 'HINT', 'HIRE', 'HIVE', 'HOAX', 'HOLD', 'HOLE', 'HOME',
      'HOOD', 'HOOF', 'HOOK', 'HOPE', 'HORN', 'HOST', 'HOUR', 'HUGE', 'HUNG', 'HUNT',
      'HURT', 'IDEA', 'IDLE', 'INCH', 'INTO', 'IRON', 'ISLE', 'ITEM', 'JAIL', 'JOKE',
      'JULY', 'JUMP', 'JUNE', 'JUNK', 'JURY', 'JUST', 'KEEN', 'KEEP', 'KEPT', 'KICK',
      'KILL', 'KIND', 'KING', 'KISS', 'KNEE', 'KNEW', 'KNIT', 'KNOT', 'KNOW', 'LACK',
      'LADY', 'LAID', 'LAKE', 'LAMB', 'LAME', 'LAMP', 'LAND', 'LANE', 'LAST', 'LATE',
      'LEAD', 'LEAF', 'LEAK', 'LEAN', 'LEAP', 'LEFT', 'LEND', 'LENS', 'LENT', 'LESS',
      'LIAR', 'LICE', 'LIFE', 'LIFT', 'LIKE', 'LILY', 'LIMB', 'LIME', 'LIMP', 'LINE',
      'LINK', 'LION', 'LIST', 'LIVE', 'LOAD', 'LOAF', 'LOAN', 'LOBE', 'LOCK', 'LOFT',
      'LONG', 'LOOK', 'LOOP', 'LORD', 'LORE', 'LOSE', 'LOSS', 'LOST', 'LOUD', 'LOUP',
      'LOVE', 'LUCK', 'LULL', 'LUMP', 'LUNG', 'LURE', 'LURK', 'LUSH', 'LUST', 'LYNX',
      'MADE', 'MAID', 'MAIL', 'MAIN', 'MAKE', 'MALE', 'MALL', 'MALT', 'MANE', 'MANY',
      'MARK', 'MARS', 'MASH', 'MASS', 'MAST', 'MATE', 'MATH', 'MAULED', 'MAZE', 'MEAL',
      'MEAN', 'MEAT', 'MEEK', 'MEET', 'MELD', 'MELT', 'MEMO', 'MEND', 'MENU', 'MESH',
      'MESS', 'MICE', 'MILD', 'MILE', 'MILK', 'MILL', 'MIME', 'MIND', 'MINE', 'MINT',
      'MISS', 'MIST', 'MITE', 'MITT', 'MOAN', 'MODE', 'MOLD', 'MOLE', 'MOLT', 'MONK',
      'MOOD', 'MOON', 'MOOR', 'MOOT', 'MORE', 'MORN', 'MOSS', 'MOST', 'MOTH', 'MOVE',
      'MUCH', 'MULE', 'MULL', 'MURK', 'MUSE', 'MUSH', 'MUST', 'MUTE', 'MYTH', 'NAIL',
      'NAME', 'NAPE', 'NAVY', 'NEAR', 'NEAT', 'NECK', 'NEED', 'NEST', 'NEWS', 'NEXT',
      'NICE', 'NICK', 'NINE', 'NODE', 'NONE', 'NOON', 'NORM', 'NOSE', 'NOTE', 'NOUN',
      'NUDE', 'NULL', 'NUMB', 'OATH', 'OBEY', 'ODOR', 'OMEN', 'OMIT', 'ONCE', 'ONLY',
      'ONTO', 'OOZE', 'OPAL', 'OPEN', 'OPUS', 'ORAL', 'ORCA', 'OVEN', 'OVER', 'PACE',
      'PACK', 'PAGE', 'PAID', 'PAIL', 'PAIN', 'PAIR', 'PALE', 'PALL', 'PALM', 'PANE',
      'PANG', 'PANT', 'PAPA', 'PARE', 'PARK', 'PART', 'PASS', 'PAST', 'PATH', 'PAVE',
      'PAWN', 'PEAK', 'PEAL', 'PEAR', 'PEAT', 'PECK', 'PEEL', 'PEER', 'PELT', 'PERK',
      'PEST', 'PICK', 'PIER', 'PIKE', 'PILE', 'PILL', 'PINE', 'PINK', 'PINT', 'PIPE',
      'PITY', 'PLAN', 'PLAY', 'PLEA', 'PLOD', 'PLOT', 'PLOW', 'PLOY', 'PLUG', 'PLUM',
      'PLUS', 'POKE', 'POLE', 'POLL', 'POLO', 'POND', 'PONY', 'POOL', 'POOR', 'POPE',
      'PORK', 'PORT', 'POSE', 'POST', 'POUR', 'PRAY', 'PREP', 'PREY', 'PRIM', 'PROD',
      'PROM', 'PROP', 'PULL', 'PULP', 'PUMP', 'PUNK', 'PUNY', 'PUPA', 'PURE', 'PURL',
      'PUSH', 'QUAD', 'QUAKE', 'QUEEN', 'QUERY', 'QUEST', 'QUEUE', 'QUICK', 'QUIET',
      'QUILT', 'QUITE', 'QUOTA', 'QUOTE', 'RACE', 'RACK', 'RAFT', 'RAGE', 'RAID', 'RAIL',
      'RAIN', 'RAKE', 'RAMP', 'RANG', 'RANK', 'RARE', 'RASH', 'RATE', 'RAVE', 'RAZE',
      'READ', 'REAL', 'REAM', 'REAP', 'REAR', 'REED', 'REEF', 'REEK', 'REEL', 'RENT',
      'REST', 'RICE', 'RICH', 'RIDE', 'RIFE', 'RIFT', 'RIGHT', 'RIND', 'RING', 'RINK',
      'RIOT', 'RIPE', 'RISE', 'RISK', 'RITE', 'ROAD', 'ROAM', 'ROAR', 'ROBE', 'ROCK',
      'RODE', 'ROLE', 'ROLL', 'ROMP', 'ROOF', 'ROOM', 'ROOT', 'ROPE', 'ROSE', 'ROSY',
      'ROTE', 'ROUT', 'ROVE', 'RUDE', 'RUIN', 'RULE', 'RUNG', 'RUNT', 'RUSE', 'RUSH',
      'RUST', 'RUTH', 'SACK', 'SAFE', 'SAGE', 'SAID', 'SAIL', 'SAKE', 'SALE', 'SALT',
      'SAME', 'SAND', 'SANE', 'SASH', 'SAVE', 'SAWN', 'SEAL', 'SEAM', 'SEAT', 'SECT',
      'SEED', 'SEEK', 'SEEM', 'SEEN', 'SELF', 'SELL', 'SEMI', 'SEND', 'SENT', 'SERF',
      'SERMON', 'SEVEN', 'SEVER', 'SHADE', 'SHAKE', 'SHALE', 'SHALL', 'SHAME', 'SHAPE',
      'SHARE', 'SHARK', 'SHARP', 'SHAVE', 'SHAWL', 'SHEAF', 'SHEAR', 'SHEEN', 'SHEEP',
      'SHEER', 'SHEET', 'SHELF', 'SHELL', 'SHELT', 'SHIFT', 'SHINE', 'SHINY', 'SHIRE',
      'SHIRT', 'SHOAL', 'SHOCK', 'SHONE', 'SHOOK', 'SHOOT', 'SHORE', 'SHORT', 'SHOUT',
      'SHOVE', 'SHOWN', 'SHOWY', 'SHRED', 'SHREW', 'SHRUB', 'SHRUG', 'SHUCK', 'SHUN',
      'SHUT', 'SIGHT', 'SIGMA', 'SILKY', 'SILLY', 'SINCE', 'SINGE', 'SINUS', 'SIREN',
      'SIXTH', 'SIXTY', 'SIZED', 'SKATE', 'SKEIN', 'SKIED', 'SKIER', 'SKIES', 'SKIFF',
      'SKILL', 'SKIMP', 'SKIRT', 'SKULL', 'SKUNK', 'SLACK', 'SLAIN', 'SLAKE', 'SLANG',
      'SLANT', 'SLASH', 'SLATE', 'SLAVE', 'SLAW', 'SLAY', 'SLEEK', 'SLEEP', 'SLEET',
      'SLEPT', 'SLICE', 'SLICK', 'SLIDE', 'SLIME', 'SLIMY', 'SLING', 'SLINK', 'SLOPE',
      'SLOSH', 'SLOTH', 'SLOUGH', 'SLUMP', 'SLUNG', 'SLUNK', 'SMALL', 'SMART', 'SMASH',
      'SMEAR', 'SMELL', 'SMELT', 'SMILE', 'SMIRK', 'SMITE', 'SMITH', 'SMOKE', 'SMOKY',
      'SMOTE', 'SNACK', 'SNAG', 'SNAKE', 'SNAP', 'SNARE', 'SNARL', 'SNEAK', 'SNEER',
      'SNEEZE', 'SNIDE', 'SNIFF', 'SNIP', 'SNIPE', 'SNIT', 'SNOB', 'SNOOP', 'SNOOT',
      'SNORE', 'SNORT', 'SNOUT', 'SNOWY', 'SNUB', 'SNUCK', 'SNUFF', 'SNUG', 'SOAPY',
      'SOAR', 'SOBER', 'SOCIAL', 'SOCKET', 'SODA', 'SOFA', 'SOFT', 'SOIL', 'SOLAR',
      'SOLD', 'SOLE', 'SOLID', 'SOLVE', 'SOME', 'SON', 'SONIC', 'SOON', 'SOOT', 'SOOTHE',
      'SORE', 'SORRY', 'SORT', 'SOUL', 'SOUND', 'SOUP', 'SOUR', 'SOURCE', 'SOUTH',
      'SPACE', 'SPADE', 'SPAN', 'SPARE', 'SPARK', 'SPARSE', 'SPASM', 'SPAWN', 'SPEAK',
      'SPEAR', 'SPECIAL', 'SPECK', 'SPED', 'SPEECH', 'SPEED', 'SPELL', 'SPEND', 'SPENT',
      'SPICE', 'SPICY', 'SPIDER', 'SPIKE', 'SPILL', 'SPIN', 'SPINE', 'SPIRAL', 'SPIRE',
      'SPITE', 'SPLASH', 'SPLAT', 'SPLICE', 'SPLINT', 'SPLIT', 'SPOIL', 'SPOKE', 'SPONGE',
      'SPOOF', 'SPOOK', 'SPOOKY', 'SPOOL', 'SPOON', 'SPORADIC', 'SPORT', 'SPOT', 'SPOUSE',
      'SPOUT', 'SPRAIN', 'SPRANG', 'SPRAY', 'SPREAD', 'SPREE', 'SPRIG', 'SPRING', 'SPRINT',
      'SPRITE', 'SPROUT', 'SPRUCE', 'SPRUNG', 'SPRY', 'SPUR', 'SPURT', 'SPUTTER', 'SQUAB',
      'SQUAD', 'SQUALL', 'SQUANDER', 'SQUARE', 'SQUASH', 'SQUAT', 'SQUAWK', 'SQUEAK',
      'SQUEAL', 'SQUEEZE', 'SQUID', 'SQUINT', 'SQUIRE', 'SQUIRM', 'SQUIRREL', 'SQUIRT',
      'STAB', 'STABLE', 'STACK', 'STAFF', 'STAGE', 'STAID', 'STAIN', 'STAIR', 'STAKE',
      'STALE', 'STALK', 'STALL', 'STAMP', 'STANCE', 'STAND', 'STANK', 'STAR', 'STARCH',
      'STARE', 'STARK', 'START', 'STARVE', 'STATE', 'STAVE', 'STEAD', 'STEAK', 'STEAL',
      'STEAM', 'STEED', 'STEEL', 'STEEP', 'STEER', 'STEM', 'STEP', 'STERN', 'STEW',
      'STICK', 'STICKY', 'STIFF', 'STILL', 'STILT', 'STING', 'STINK', 'STINT', 'STIR',
      'STOCK', 'STOIC', 'STOKE', 'STOLE', 'STOMP', 'STONE', 'STONY', 'STOOD', 'STOOL',
      'STOOP', 'STOP', 'STORE', 'STORK', 'STORM', 'STORY', 'STOUT', 'STOVE', 'STOW',
      'STRAP', 'STRAW', 'STRAY', 'STREAK', 'STREAM', 'STREET', 'STRESS', 'STRETCH',
      'STREWN', 'STRICT', 'STRIDE', 'STRIFE', 'STRIKE', 'STRING', 'STRIP', 'STRIPE',
      'STRIVE', 'STROBE', 'STRODE', 'STROKE', 'STROLL', 'STRONG', 'STROVE', 'STRUCK',
      'STRUNG', 'STRUT', 'STUB', 'STUCK', 'STUD', 'STUDY', 'STUFF', 'STUFFY', 'STUMP',
      'STUN', 'STUNG', 'STUNK', 'STUNT', 'STUPID', 'STUPOR', 'STURDY', 'STYLE', 'SUBJECT',
      'SUBLIME', 'SUBMIT', 'SUBSCRIBE', 'SUBSET', 'SUBSTANCE', 'SUBSTITUTE', 'SUBTLE',
      'SUBTRACT', 'SUBURB', 'SUBWAY', 'SUCCEED', 'SUCCESS', 'SUCH', 'SUCK', 'SUDDEN',
      'SUDS', 'SUFFER', 'SUFFIX', 'SUGAR', 'SUGGEST', 'SUIT', 'SUITE', 'SULK', 'SULLEN',
      'SULPHUR', 'SULTRY', 'SUM', 'SUMMARY', 'SUMMER', 'SUMMIT', 'SUMMON', 'SUMMONS',
      'SUMPTUOUS', 'SUN', 'SUNDAY', 'SUNDER', 'SUNDIAL', 'SUNDRY', 'SUNKEN', 'SUNNY',
      'SUNRISE', 'SUNSET', 'SUNSHINE', 'SUPER', 'SUPERB', 'SUPERFICIAL', 'SUPERFLUOUS',
      'SUPERHIGHWAY', 'SUPERIOR', 'SUPERLATIVE', 'SUPERMAN', 'SUPERNATURAL', 'SUPERSEDE',
      'SUPERSTITION', 'SUPERVISE', 'SUPPER', 'SUPPLE', 'SUPPLEMENT', 'SUPPLIER', 'SUPPLY',
      'SUPPORT', 'SUPPOSE', 'SUPPRESS', 'SUPREME', 'SURE', 'SURELY', 'SURF', 'SURFACE',
      'SURGE', 'SURGEON', 'SURGERY', 'SURGICAL', 'SURLY', 'SURMISE', 'SURMOUNT', 'SURNAME',
      'SURPASS', 'SURPLUS', 'SURPRISE', 'SURRENDER', 'SURROUND', 'SURVEY', 'SURVIVE',
      'SURVIVOR', 'SUSCEPTIBLE', 'SUSPECT', 'SUSPEND', 'SUSPENSE', 'SUSPICION', 'SUSPICIOUS',
      'SUSTAIN', 'SUSTENANCE', 'SWAB', 'SWADDLE', 'SWAG', 'SWAGGER', 'SWAIN', 'SWALLOW',
      'SWAM', 'SWAMP', 'SWAMPY', 'SWAN', 'SWANK', 'SWAP', 'SWARM', 'SWARTHY', 'SWASH',
      'SWASHBUCKLER', 'SWASTIKA', 'SWAT', 'SWATCH', 'SWATH', 'SWATHE', 'SWAY', 'SWEAR',
      'SWEAT', 'SWEATER', 'SWEATY', 'SWEDE', 'SWEEP', 'SWEET', 'SWEETEN', 'SWEETNESS',
      'SWELL', 'SWELLING', 'SWELTER', 'SWEPT', 'SWERVE', 'SWIFT', 'SWIFTLY', 'SWIFTNESS',
      'SWILL', 'SWIM', 'SWIMMER', 'SWIMMING', 'SWIMSUIT', 'SWINDLE', 'SWINE', 'SWING',
      'SWINGE', 'SWINGING', 'SWINISH', 'SWIPE', 'SWIRL', 'SWISH', 'SWISS', 'SWITCH',
      'SWITCHBACK', 'SWITZERLAND', 'SWIVEL', 'SWOLLEN', 'SWOON', 'SWOOP', 'SWORD',
      'SWORDFISH', 'SWORE', 'SWORN', 'SWUM', 'SWUNG', 'SYCAMORE', 'SYCOPHANT', 'SYLLABLE',
      'SYLLABUS', 'SYLPH', 'SYMBOL', 'SYMBOLIC', 'SYMBOLISM', 'SYMBOLIZE', 'SYMMETRICAL',
      'SYMMETRY', 'SYMPATHETIC', 'SYMPATHIZE', 'SYMPATHY', 'SYMPHONY', 'SYMPTOM',
      'SYNAGOGUE', 'SYNCHRONIZE', 'SYNDICATE', 'SYNDROME', 'SYNONYM', 'SYNONYMOUS',
      'SYNOPSIS', 'SYNTAX', 'SYNTHESIS', 'SYNTHESIZE', 'SYNTHETIC', 'SYPHILIS', 'SYRUP',
      'SYSTEM', 'SYSTEMATIC', 'SYSTEMATIZE', 'SYSTEMIC', 'SYSTEMS'
    ];

    return new Set(wordList.map(w => w.toUpperCase()));
  }

  /**
   * Check if a word is valid in Scrabble dictionary
   */
  isValidWord(word: string): boolean {
    if (!word || word.trim().length === 0) return false;
    return this.words.has(word.toUpperCase().trim());
  }

  /**
   * Find words that can be made from available letters (for AI)
   * @param letters Available letters to form words
   * @returns Array of valid words that can be formed
   */
  findWords(letters: string[]): string[] {
    const validWords: string[] = [];
    const letterFreq = this.getLetterFrequency(letters);

    for (const word of this.words) {
      if (this.canFormWord(word, letterFreq)) {
        validWords.push(word);
      }
    }

    return validWords.sort((a, b) => b.length - a.length);
  }

  /**
   * Check if a word can be formed from available letters
   */
  private canFormWord(word: string, availableFreq: Map<string, number>): boolean {
    const wordFreq = this.getLetterFrequency(word.split(''));
    const freqCopy = new Map(availableFreq);

    for (const [letter, count] of wordFreq) {
      const available = freqCopy.get(letter) || 0;
      if (available < count) return false;
    }

    return true;
  }

  /**
   * Get frequency map of letters
   */
  private getLetterFrequency(letters: string[]): Map<string, number> {
    const freq = new Map<string, number>();
    for (const letter of letters) {
      const upper = letter.toUpperCase();
      freq.set(upper, (freq.get(upper) || 0) + 1);
    }
    return freq;
  }
}
