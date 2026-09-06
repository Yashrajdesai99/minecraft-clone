export class HealthSystem {
  private currentHealth: number = 20; // 10 hearts
  private maxHealth: number = 20;
  private lastDamageTime: number = 0;
  private invulnerabilityDuration: number = 20; // ticks

  public damage(amount: number, source: string): boolean {
    const now = Date.now();
    if (now - this.lastDamageTime < this.invulnerabilityDuration * 50) {
      return false; // Invulnerable
    }

    this.currentHealth = Math.max(0, this.currentHealth - amount);
    this.lastDamageTime = now;
    return true;
  }

  public heal(amount: number): void {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
  }

  public getHealth(): number {
    return this.currentHealth;
  }

  public getMaxHealth(): number {
    return this.maxHealth;
  }

  public isDead(): boolean {
    return this.currentHealth <= 0;
  }
}

export class HungerSystem {
  private hunger: number = 20; // 10 shanks
  private maxHunger: number = 20;
  private saturation: number = 10;
  private maxSaturation: number = 20;
  private lastHungerTime: number = 0;
  private hungerTickInterval: number = 4000; // ms

  public update(deltaTime: number): void {
    this.lastHungerTime += deltaTime * 1000;

    if (this.lastHungerTime > this.hungerTickInterval) {
      // Gradually decrease hunger
      if (this.saturation > 0) {
        this.saturation -= 0.1;
      } else {
        this.hunger -= 0.1;
      }

      // Heal if above 90% hunger
      if (this.hunger > 18 && this.saturation > 10) {
        // Player heals naturally
      }

      this.hunger = Math.max(0, this.hunger);
      this.saturation = Math.max(0, Math.min(this.maxSaturation, this.saturation));
      this.lastHungerTime = 0;
    }
  }

  public eat(food: FoodData): void {
    this.hunger = Math.min(this.maxHunger, this.hunger + food.hungerRestoration);
    this.saturation = Math.min(
      this.maxSaturation,
      this.saturation + food.saturation
    );
  }

  public getHunger(): number {
    return this.hunger;
  }

  public getSaturation(): number {
    return this.saturation;
  }

  public isFamished(): boolean {
    return this.hunger === 0;
  }
}

export interface FoodData {
  name: string;
  hungerRestoration: number;
  saturation: number;
  eatingTime: number;
  effects?: StatusEffect[];
}

export interface StatusEffect {
  type: string;
  duration: number;
  amplifier: number;
}
