export enum WeatherType {
  CLEAR = 'clear',
  RAIN = 'rain',
  STORM = 'storm',
  SNOW = 'snow'
}

export class WeatherSystem {
  private currentWeather: WeatherType = WeatherType.CLEAR;
  private weatherTime: number = 0;
  private weatherDuration: number = 10000; // ticks
  private seed: number;
  private time: number = 0;

  constructor(seed: number) {
    this.seed = seed;
  }

  public update(deltaTime: number): void {
    this.time += deltaTime;
    this.weatherTime += deltaTime;

    if (this.weatherTime > this.weatherDuration) {
      this.changeWeather();
      this.weatherTime = 0;
    }
  }

  private changeWeather(): void {
    const rand = this.seededRandom();

    if (rand < 0.6) {
      this.currentWeather = WeatherType.CLEAR;
    } else if (rand < 0.85) {
      this.currentWeather = WeatherType.RAIN;
    } else if (rand < 0.95) {
      this.currentWeather = WeatherType.STORM;
    } else {
      this.currentWeather = WeatherType.SNOW;
    }

    this.weatherDuration = 5000 + Math.random() * 15000;
  }

  public getWeather(): WeatherType {
    return this.currentWeather;
  }

  private seededRandom(): number {
    const n = Math.sin(this.time * 12.9898 + this.seed) * 43758.5453;
    return n - Math.floor(n);
  }
}
