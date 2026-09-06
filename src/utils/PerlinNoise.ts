export class PerlinNoise {
  private permutation: number[] = [];
  private p: number[] = [];

  constructor(seed: number = 0) {
    this.buildPermutation(seed);
  }

  private buildPermutation(seed: number): void {
    const p: number[] = [];
    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }

    // Shuffle with seed
    for (let i = 255; i > 0; i--) {
      const j = Math.floor((seed * 73856093 ^ (i * 19349663)) % (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }

    this.permutation = p;
    this.p = [];
    for (let i = 0; i < 512; i++) {
      this.p[i] = this.permutation[i & 255];
    }
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number, z: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 8 ? y : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  public noise(x: number, y: number, z: number = 0): number {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const zi = Math.floor(z) & 255;

    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const zf = z - Math.floor(z);

    const u = this.fade(xf);
    const v = this.fade(yf);
    const w = this.fade(zf);

    const aaa = this.p[this.p[this.p[xi] + yi] + zi];
    const aba = this.p[this.p[this.p[xi] + yi + 1] + zi];
    const aab = this.p[this.p[this.p[xi] + yi] + zi + 1];
    const abb = this.p[this.p[this.p[xi] + yi + 1] + zi + 1];
    const baa = this.p[this.p[this.p[xi + 1] + yi] + zi];
    const bba = this.p[this.p[this.p[xi + 1] + yi + 1] + zi];
    const bab = this.p[this.p[this.p[xi + 1] + yi] + zi + 1];
    const bbb = this.p[this.p[this.p[xi + 1] + yi + 1] + zi + 1];

    const g0 = this.grad(aaa, xf, yf, zf);
    const g1 = this.grad(baa, xf - 1, yf, zf);
    const i0 = this.lerp(u, g0, g1);

    const g2 = this.grad(aba, xf, yf - 1, zf);
    const g3 = this.grad(bba, xf - 1, yf - 1, zf);
    const i1 = this.lerp(u, g2, g3);

    const i2 = this.lerp(v, i0, i1);

    const g4 = this.grad(aab, xf, yf, zf - 1);
    const g5 = this.grad(bab, xf - 1, yf, zf - 1);
    const i3 = this.lerp(u, g4, g5);

    const g6 = this.grad(abb, xf, yf - 1, zf - 1);
    const g7 = this.grad(bbb, xf - 1, yf - 1, zf - 1);
    const i4 = this.lerp(u, g6, g7);

    const i5 = this.lerp(v, i3, i4);

    return this.lerp(w, i2, i5);
  }
}
