import { Item } from './Inventory';

export interface RecipeInput {
  item: Item;
  count: number;
}

export interface RecipeOutput {
  item: Item;
  count: number;
}

export interface Recipe {
  id: string;
  inputs: RecipeInput[];
  output: RecipeOutput;
  station?: string; // crafting_table, furnace, etc.
  time?: number; // In seconds
}

export class CraftingSystem {
  private recipes: Map<string, Recipe> = new Map();

  constructor() {
    this.registerDefaultRecipes();
  }

  private registerDefaultRecipes(): void {
    // Wooden pickaxe
    this.registerRecipe({
      id: 'wooden_pickaxe',
      inputs: [
        { item: new Item(1, 'wood', 'wood', 64), count: 3 },
        { item: new Item(2, 'stick', 'stick', 64), count: 2 }
      ],
      output: { item: new Item(101, 'wooden_pickaxe', 'pickaxe', 1, 'tool'), count: 1 },
      station: 'crafting_table'
    });

    // Wooden planks from logs (shapeless)
    this.registerRecipe({
      id: 'wooden_planks',
      inputs: [{ item: new Item(1, 'wood', 'wood', 64), count: 1 }],
      output: { item: new Item(2, 'planks', 'planks', 64), count: 4 }
    });
  }

  public registerRecipe(recipe: Recipe): void {
    this.recipes.set(recipe.id, recipe);
  }

  public getRecipe(id: string): Recipe | undefined {
    return this.recipes.get(id);
  }

  public getAllRecipes(): Recipe[] {
    return Array.from(this.recipes.values());
  }

  public craft(recipe: Recipe): boolean {
    // Check if inputs are available
    for (const input of recipe.inputs) {
      // TODO: Check inventory
    }

    // Remove inputs and add output
    // TODO: Update inventory

    return true;
  }
}
