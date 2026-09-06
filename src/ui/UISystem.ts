import { Logger } from '../utils/Logger';

const logger = new Logger('UISystem');

export class UISystem {
  private mainMenuVisible: boolean = true;
  private pauseMenuVisible: boolean = false;
  private inventoryVisible: boolean = false;
  private craftingVisible: boolean = false;
  private settingsVisible: boolean = false;

  public showMainMenu(): void {
    this.mainMenuVisible = true;
    this.hideAll();
    this.renderMainMenu();
  }

  public hideMainMenu(): void {
    this.mainMenuVisible = false;
  }

  public togglePauseMenu(): void {
    this.pauseMenuVisible = !this.pauseMenuVisible;
    if (this.pauseMenuVisible) {
      this.renderPauseMenu();
    }
  }

  public toggleInventory(): void {
    this.inventoryVisible = !this.inventoryVisible;
    if (this.inventoryVisible) {
      this.renderInventory();
    }
  }

  public toggleCrafting(): void {
    this.craftingVisible = !this.craftingVisible;
    if (this.craftingVisible) {
      this.renderCraftingMenu();
    }
  }

  public toggleSettings(): void {
    this.settingsVisible = !this.settingsVisible;
    if (this.settingsVisible) {
      this.renderSettings();
    }
  }

  private hideAll(): void {
    this.pauseMenuVisible = false;
    this.inventoryVisible = false;
    this.craftingVisible = false;
    this.settingsVisible = false;
  }

  private renderMainMenu(): void {
    logger.info('Rendering main menu');
    // Render main menu
  }

  private renderPauseMenu(): void {
    logger.info('Rendering pause menu');
  }

  private renderInventory(): void {
    logger.info('Rendering inventory');
  }

  private renderCraftingMenu(): void {
    logger.info('Rendering crafting menu');
  }

  private renderSettings(): void {
    logger.info('Rendering settings');
  }
}
