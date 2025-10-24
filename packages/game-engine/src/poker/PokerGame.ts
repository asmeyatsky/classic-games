import { Deck, Card } from './Card';
import { PokerPlayer } from './PokerPlayer';
import { HandEvaluator } from './HandEvaluator';
import { PokerGameState, PokerRound } from './index';

export class PokerGame {
  private deck: Deck;
  private players: PokerPlayer[] = [];
  private communityCards: Card[] = [];
  private pot: number = 0;
  private currentBet: number = 0;
  private currentRound: PokerRound = PokerRound.PRE_FLOP;
  private currentPlayerIndex: number = 0;
  private dealerIndex: number = 0;

  constructor(playerIds: string[], initialChips: number = 1000) {
    this.deck = new Deck();
    this.players = playerIds.map(id => new PokerPlayer(id, initialChips));
  }

  startNewHand(): void {
    // Reset
    this.deck.reset();
    this.deck.shuffle();
    this.communityCards = [];
    this.pot = 0;
    this.currentBet = 0;
    this.currentRound = PokerRound.PRE_FLOP;

    // Reset players
    this.players.forEach(p => p.resetForNewHand());

    // Deal hole cards
    for (let i = 0; i < 2; i++) {
      this.players.forEach(player => {
        if (player.chips > 0) {
          player.addCards(this.deck.deal(1));
        }
      });
    }

    // Move dealer button
    this.dealerIndex = (this.dealerIndex + 1) % this.players.length;
    this.currentPlayerIndex = (this.dealerIndex + 1) % this.players.length;
  }

  advanceRound(): void {
    // Reset bets for new betting round
    this.players.forEach(p => p.resetForNewRound());
    this.currentBet = 0;

    switch (this.currentRound) {
      case PokerRound.PRE_FLOP:
        // Deal flop
        this.communityCards.push(...this.deck.deal(3));
        this.currentRound = PokerRound.FLOP;
        break;
      case PokerRound.FLOP:
        // Deal turn
        this.communityCards.push(...this.deck.deal(1));
        this.currentRound = PokerRound.TURN;
        break;
      case PokerRound.TURN:
        // Deal river
        this.communityCards.push(...this.deck.deal(1));
        this.currentRound = PokerRound.RIVER;
        break;
      case PokerRound.RIVER:
        this.currentRound = PokerRound.SHOWDOWN;
        this.resolveShowdown();
        break;
    }
  }

  playerAction(playerId: string, action: 'fold' | 'check' | 'call' | 'bet' | 'raise', amount?: number): void {
    const player = this.players.find(p => p.id === playerId);
    if (!player || player.folded || player.allIn) return;

    switch (action) {
      case 'fold':
        player.fold();
        break;
      case 'check':
        // No action needed
        break;
      case 'call':
        const callAmount = this.currentBet - player.bet;
        player.placeBet(callAmount);
        this.pot += Math.min(callAmount, player.chips + player.bet);
        break;
      case 'bet':
      case 'raise':
        if (amount) {
          player.placeBet(amount - player.bet);
          this.pot += amount - player.bet;
          this.currentBet = amount;
        }
        break;
    }

    this.advancePlayer();
  }

  private advancePlayer(): void {
    do {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    } while (this.players[this.currentPlayerIndex].folded ||
             this.players[this.currentPlayerIndex].allIn);

    // Check if betting round is complete
    const activePlayers = this.players.filter(p => !p.folded && !p.allIn);
    const allBetsEqual = activePlayers.every(p => p.bet === this.currentBet || p.chips === 0);

    if (allBetsEqual) {
      this.advanceRound();
    }
  }

  private resolveShowdown(): void {
    const activePlayers = this.players.filter(p => !p.folded);

    if (activePlayers.length === 1) {
      activePlayers[0].chips += this.pot;
      return;
    }

    const evaluations = activePlayers.map(player => ({
      player,
      hand: HandEvaluator.evaluate([...player.hand, ...this.communityCards])
    }));

    evaluations.sort((a, b) => HandEvaluator.compareHands(b.hand, a.hand));

    // Find all winners (could be a tie)
    const winners = [evaluations[0]];
    for (let i = 1; i < evaluations.length; i++) {
      if (HandEvaluator.compareHands(evaluations[i].hand, evaluations[0].hand) === 0) {
        winners.push(evaluations[i]);
      }
    }

    // Distribute pot
    const winAmount = this.pot / winners.length;
    winners.forEach(({ player }) => {
      player.chips += winAmount;
    });
  }

  getState(): PokerGameState {
    return {
      pot: this.pot,
      communityCards: this.communityCards,
      currentBet: this.currentBet,
      round: this.currentRound,
      players: this.players.map(p => p.getState()),
    };
  }

  get activePlayers(): PokerPlayer[] {
    return this.players.filter(p => !p.folded);
  }

  get currentPlayer(): PokerPlayer {
    return this.players[this.currentPlayerIndex];
  }
}
