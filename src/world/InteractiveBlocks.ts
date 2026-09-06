import * as THREE from 'three';

export class InteractiveBlock {
  public id: number;
  public name: string;
  public state: any = {};
  public mesh: THREE.Mesh | null = null;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }

  public interact(): void {
    console.log(`Interacting with ${this.name}`);
  }

  public updateState(newState: any): void {
    this.state = { ...this.state, ...newState };
  }

  public getState(): any {
    return { ...this.state };
  }
}

export class Door extends InteractiveBlock {
  public isOpen: boolean = false;

  constructor() {
    super(20, 'door');
  }

  public interact(): void {
    this.isOpen = !this.isOpen;
    this.updateState({ open: this.isOpen });
    console.log(`Door is now ${this.isOpen ? 'open' : 'closed'}`);
  }
}

export class Chest extends InteractiveBlock {
  public inventory: any[] = Array(27).fill(null);
  public isOpen: boolean = false;

  constructor() {
    super(21, 'chest');
  }

  public interact(): void {
    this.isOpen = !this.isOpen;
    console.log(`Chest is now ${this.isOpen ? 'open' : 'closed'}`);
  }

  public addItem(item: any): void {
    for (let i = 0; i < this.inventory.length; i++) {
      if (this.inventory[i] === null) {
        this.inventory[i] = item;
        return;
      }
    }
  }
}

export class Furnace extends InteractiveBlock {
  public inputSlot: any = null;
  public fuelSlot: any = null;
  public outputSlot: any = null;
  public progress: number = 0;
  public isActive: boolean = false;

  constructor() {
    super(22, 'furnace');
  }

  public interact(): void {
    console.log('Opening furnace UI');
  }

  public update(deltaTime: number): void {
    if (this.inputSlot && this.fuelSlot && !this.outputSlot) {
      this.progress += deltaTime;
      if (this.progress > 1.0) {
        this.smelt();
        this.progress = 0;
      }
    }
  }

  private smelt(): void {
    if (this.inputSlot) {
      this.outputSlot = { ...this.inputSlot };
      this.inputSlot = null;
      console.log('Smelting complete');
    }
  }
}
