export class AnimationController {
  private animations: Map<string, Animation> = new Map();
  private currentAnimation: Animation | null = null;
  private time: number = 0;

  public addAnimation(name: string, frames: number, duration: number): void {
    this.animations.set(name, {
      name,
      frames,
      duration,
      frameTime: duration / frames
    });
  }

  public play(name: string, loop: boolean = false): void {
    const animation = this.animations.get(name);
    if (animation) {
      this.currentAnimation = animation;
      this.time = 0;
    }
  }

  public update(deltaTime: number): void {
    if (!this.currentAnimation) return;

    this.time += deltaTime;

    if (this.time > this.currentAnimation.duration) {
      this.time = 0;
      this.currentAnimation = null;
    }
  }

  public getCurrentFrame(): number {
    if (!this.currentAnimation) return 0;
    return Math.floor(this.time / this.currentAnimation.frameTime);
  }
}

interface Animation {
  name: string;
  frames: number;
  duration: number;
  frameTime: number;
}
