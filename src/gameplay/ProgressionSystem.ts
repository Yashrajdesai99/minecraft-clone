export class ProgressionSystem {
  private playerLevel: number = 0;
  private playerExperience: number = 0;
  private experienceRequirements: number[] = [];
  private unlockedUpgrades: Set<string> = new Set();

  constructor() {
    this.generateExperienceRequirements();
  }

  private generateExperienceRequirements(): void {
    for (let i = 0; i < 100; i++) {
      this.experienceRequirements[i] = Math.floor(i * i * 5 + i * 100);
    }
  }

  public addExperience(amount: number): void {
    this.playerExperience += amount;

    while (
      this.playerLevel < this.experienceRequirements.length &&
      this.playerExperience >= this.experienceRequirements[this.playerLevel]
    ) {
      this.levelUp();
    }
  }

  private levelUp(): void {
    this.playerLevel++;
    console.log(`Level up! Now level ${this.playerLevel}`);
  }

  public getLevel(): number {
    return this.playerLevel;
  }

  public getExperience(): number {
    return this.playerExperience;
  }

  public getExperienceForNextLevel(): number {
    if (this.playerLevel >= this.experienceRequirements.length) {
      return this.experienceRequirements[this.experienceRequirements.length - 1];
    }
    return this.experienceRequirements[this.playerLevel];
  }

  public unlockUpgrade(upgradeId: string): void {
    this.unlockedUpgrades.add(upgradeId);
  }

  public hasUpgrade(upgradeId: string): boolean {
    return this.unlockedUpgrades.has(upgradeId);
  }
}
