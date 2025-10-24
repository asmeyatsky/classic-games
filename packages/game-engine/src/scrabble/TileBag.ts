import { ScrabbleTile, TILE_VALUES } from './index';

export class TileBag {
  private tiles: ScrabbleTile[] = [];

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Standard Scrabble tile distribution
    const distribution: Record<string, number> = {
      A: 9, B: 2, C: 2, D: 4, E: 12, F: 2, G: 3, H: 2, I: 9, J: 1,
      K: 1, L: 4, M: 2, N: 6, O: 8, P: 2, Q: 1, R: 6, S: 4, T: 6,
      U: 4, V: 2, W: 2, X: 1, Y: 2, Z: 1, '_': 2
    };

    for (const [letter, count] of Object.entries(distribution)) {
      for (let i = 0; i < count; i++) {
        this.tiles.push({
          letter,
          value: TILE_VALUES[letter],
          isBlank: letter === '_'
        });
      }
    }

    this.shuffle();
  }

  private shuffle(): void {
    for (let i = this.tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
    }
  }

  /**
   * Draw tiles from the bag
   */
  drawTiles(count: number): ScrabbleTile[] {
    return this.tiles.splice(0, Math.min(count, this.tiles.length));
  }

  /**
   * Return tiles to the bag (for exchanges)
   */
  returnTile(tile: ScrabbleTile): void {
    this.tiles.push(tile);
    this.shuffle();
  }

  /**
   * Get remaining tiles count
   */
  getRemaining(): number {
    return this.tiles.length;
  }

  /**
   * Legacy method for backward compatibility
   */
  draw(count: number): ScrabbleTile[] {
    return this.drawTiles(count);
  }

  /**
   * Legacy getter for backward compatibility
   */
  get remaining(): number {
    return this.getRemaining();
  }
}
