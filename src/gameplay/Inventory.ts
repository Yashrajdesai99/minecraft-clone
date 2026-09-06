export class Item {
  public id: number;
  public name: string;
  public icon: string;
  public maxStack: number;
  public type: string;
  public durability?: number;
  public maxDurability?: number;

  constructor(
    id: number,
    name: string,
    icon: string,
    maxStack: number = 64,
    type: string = 'block'
  ) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.maxStack = maxStack;
    this.type = type;
  }
}

export class ItemStack {
  public item: Item;
  public count: number;
  public durability?: number;
  public metadata?: any;

  constructor(item: Item, count: number = 1) {
    this.item = item;
    this.count = Math.min(count, item.maxStack);
  }

  public canStack(other: ItemStack): boolean {
    return this.item.id === other.item.id && this.count < this.item.maxStack;
  }

  public add(count: number): number {
    const space = this.item.maxStack - this.count;
    const added = Math.min(count, space);
    this.count += added;
    return count - added;
  }
}

export class Inventory {
  private slots: (ItemStack | null)[] = Array(36).fill(null);
  private hotbarSlots: (ItemStack | null)[] = Array(9).fill(null);
  private selectedSlot: number = 0;
  private cursorItem: ItemStack | null = null;

  public addItem(item: Item, count: number = 1): number {
    let remaining = count;

    // Try to add to existing stacks
    for (let i = 0; i < this.slots.length; i++) {
      if (remaining === 0) break;
      const slot = this.slots[i];
      if (slot && slot.item.id === item.id && slot.count < item.maxStack) {
        remaining = slot.add(remaining);
      }
    }

    // Add to empty slots
    if (remaining > 0) {
      for (let i = 0; i < this.slots.length; i++) {
        if (remaining === 0) break;
        if (this.slots[i] === null) {
          this.slots[i] = new ItemStack(item, remaining);
          remaining = Math.max(0, remaining - item.maxStack);
        }
      }
    }

    return remaining;
  }

  public removeItem(item: Item, count: number): number {
    let removed = 0;

    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i];
      if (slot && slot.item.id === item.id) {
        const toRemove = Math.min(count - removed, slot.count);
        slot.count -= toRemove;
        removed += toRemove;

        if (slot.count === 0) {
          this.slots[i] = null;
        }

        if (removed >= count) break;
      }
    }

    return removed;
  }

  public getSlot(index: number): ItemStack | null {
    if (index < 9) return this.hotbarSlots[index];
    return this.slots[index - 9];
  }

  public setSlot(index: number, item: ItemStack | null): void {
    if (index < 9) {
      this.hotbarSlots[index] = item;
    } else {
      this.slots[index - 9] = item;
    }
  }

  public getSelectedItem(): ItemStack | null {
    return this.hotbarSlots[this.selectedSlot];
  }

  public selectSlot(index: number): void {
    if (index >= 0 && index < 9) {
      this.selectedSlot = index;
    }
  }

  public isFull(): boolean {
    return this.slots.every(s => s !== null) && 
           this.hotbarSlots.every(s => s !== null);
  }
}
