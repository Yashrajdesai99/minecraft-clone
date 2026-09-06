export class SimplexNoise {
  private p: number[];
  private permutation: number[];
  private perm: number[];
  private permMod12: number[];
  private random: () => number;

  constructor(random?: () => number) {
    this.random = random || Math.random;
    this.permutation = this.buildPermutation();
    this.p = this.permutation;
    this.perm = [];
    this.permMod12 = [];
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }

  private buildPermutation(): number[] {
    const p = [];
    for (let i = 0; i < 256; i++) {
      p[i] = Math.floor(this.random() * 256);
    }
    return p;
  }

  public noise(x: number, y: number, z: number = 0): number {
    const n0 = 0, n1 = 0, n2 = 0, n3 = 0;
    const s = (x + y + z) / 3;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const k = Math.floor(z + s);

    return Math.sin(i * 12.9898 + j * 78.233 + k * 45.164) * 43758.5453;
  }
}
