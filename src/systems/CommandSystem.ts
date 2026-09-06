import { Logger } from '../utils/Logger';

const logger = new Logger('CommandSystem');

export interface Command {
  name: string;
  description: string;
  execute(args: string[]): void;
}

export class CommandSystem {
  private commands: Map<string, Command> = new Map();

  constructor() {
    this.registerDefaultCommands();
  }

  private registerDefaultCommands(): void {
    this.register({
      name: 'time',
      description: 'Set world time',
      execute: (args: string[]) => {
        logger.info(`Setting time to ${args[0]}`);
      }
    });

    this.register({
      name: 'weather',
      description: 'Set weather',
      execute: (args: string[]) => {
        logger.info(`Setting weather to ${args[0]}`);
      }
    });

    this.register({
      name: 'gamemode',
      description: 'Set game mode',
      execute: (args: string[]) => {
        logger.info(`Setting game mode to ${args[0]}`);
      }
    });

    this.register({
      name: 'give',
      description: 'Give item to player',
      execute: (args: string[]) => {
        logger.info(`Giving ${args[1]} of ${args[0]}`);
      }
    });

    this.register({
      name: 'setblock',
      description: 'Set block at position',
      execute: (args: string[]) => {
        logger.info(`Setting block at ${args[0]}, ${args[1]}, ${args[2]}`);
      }
    });
  }

  public register(command: Command): void {
    this.commands.set(command.name, command);
  }

  public execute(input: string): void {
    const parts = input.trim().split(' ');
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    const command = this.commands.get(commandName);
    if (command) {
      command.execute(args);
    } else {
      logger.warn(`Unknown command: ${commandName}`);
    }
  }
}
