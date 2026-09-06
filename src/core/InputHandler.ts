export class InputHandler {
  private keysPressed: Set<string> = new Set();

  public setKeyPressed(key: string, pressed: boolean): void {
    const lowerKey = key.toLowerCase();
    if (pressed) {
      this.keysPressed.add(lowerKey);
    } else {
      this.keysPressed.delete(lowerKey);
    }
  }

  public isKeyPressed(key: string): boolean {
    return this.keysPressed.has(key.toLowerCase());
  }

  public isMoving(): boolean {
    return this.isKeyPressed('w') || this.isKeyPressed('a') || 
           this.isKeyPressed('s') || this.isKeyPressed('d');
  }

  public getMovementDirection(): { forward: boolean; left: boolean; right: boolean; backward: boolean } {
    return {
      forward: this.isKeyPressed('w'),
      left: this.isKeyPressed('a'),
      right: this.isKeyPressed('d'),
      backward: this.isKeyPressed('s')
    };
  }

  public isSprinting(): boolean {
    return this.isKeyPressed('shift');
  }

  public isJumping(): boolean {
    return this.isKeyPressed(' ');
  }

  public isCrouching(): boolean {
    return this.isKeyPressed('control');
  }

  public clearAllKeys(): void {
    this.keysPressed.clear();
  }
}
