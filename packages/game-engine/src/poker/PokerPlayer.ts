import { Card } from './Card';
import { PokerPlayerState } from './index';

export class PokerPlayer {
  id: string;
  chips: number;
  hand: Card[] = [];
  bet: number = 0;
  folded: boolean = false;
  allIn: boolean = false;
  totalBetInHand: number = 0;

  constructor(id: string, initialChips: number = 1000) {
    this.id = id;
    this.chips = initialChips;
  }

  placeBet(amount: number): void {
    const actualAmount = Math.min(amount, this.chips);
    this.chips -= actualAmount;
    this.bet += actualAmount;
    this.totalBetInHand += actualAmount;

    if (this.chips === 0) {
      this.allIn = true;
    }
  }

  fold(): void {
    this.folded = true;
  }

  resetForNewRound(): void {
    this.bet = 0;
  }

  resetForNewHand(): void {
    this.hand = [];
    this.bet = 0;
    this.folded = false;
    this.allIn = false;
    this.totalBetInHand = 0;
  }

  addCards(cards: Card[]): void {
    this.hand.push(...cards);
  }

  getState(): PokerPlayerState {
    return {
      id: this.id,
      chips: this.chips,
      hand: this.hand,
      bet: this.bet,
      folded: this.folded,
      allIn: this.allIn,
    };
  }
}
