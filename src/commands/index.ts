import { CustomCommand } from "../@types/CustomCommand";
import { createHelpCommand } from "./Help";
import { createInviteCommand } from "./Invite";
import { createVoteCommand } from "./Vote";

type CommandCreator = () => CustomCommand;

const commandCreators: CommandCreator[] = [
  createHelpCommand,
  createInviteCommand,
  createVoteCommand,
];

export function createCommands(): CustomCommand[] {
  return commandCreators.map((create) => create());
}
