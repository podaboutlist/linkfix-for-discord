import { ConfigureCommand, commandData as ConfigureCommandData } from "./Configure";
import { HelpCommand, commandData as HelpCommandData } from "./Help";
import { InviteCommand, commandData as InviteCommandData } from "./Invite";
import { VoteCommand, commandData as VoteCommandData } from "./Vote";

import { CustomCommand } from "../../@types/CustomCommand";

import { SlashCommandBuilder } from "discord.js";

export const Commands: Array<CustomCommand> = [
  HelpCommand,
  InviteCommand,
  ConfigureCommand,
  VoteCommand,
];

export const commandData: Array<SlashCommandBuilder> = [
  ConfigureCommandData,
  HelpCommandData,
  InviteCommandData,
  VoteCommandData,
];
