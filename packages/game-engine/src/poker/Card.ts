import { Card as ICard } from './index';

export class Card implements ICard {
  constructor(
    public suit: 'hearts' | 'diamonds' | 'clubs' | 'spades',
    public rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A'
  ) {}

  get displayRank(): string {
    return this.rank === 'T' ? '10' : this.rank;
  }

  get displaySuit(): string {
    const suits = {
      hearts: '♥',
      diamonds: '♦',
      clubs: '♣',
      spades: '♠',
    };
    return suits[this.suit];
  }

  get value(): number {
    const values: Record<string, number> = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
      'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    return values[this.rank];
  }

  get color(): 'red' | 'black' {
    return this.suit === 'hearts' || this.suit === 'diamonds' ? 'red' : 'black';
  }

  toString(): string {
    return `${this.rank}${this.displaySuit}`;
  }
}

export class Deck {
  private cards: Card[] = [];

  constructor() {
    this.reset();
  }

  reset(): void {
    this.cards = [];
    const suits: Array<'hearts' | 'diamonds' | 'clubs' | 'spades'> = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks: Array<'2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A'> =
      ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

    for (const suit of suits) {
      for (const rank of ranks) {
        this.cards.push(new Card(suit, rank));
      }
    }
  }

  shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal(count: number = 1): Card[] {
    return this.cards.splice(0, count);
  }

  get remaining(): number {
    return this.cards.length;
  }
}
