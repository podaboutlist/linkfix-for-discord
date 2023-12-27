import { CustomCommand } from "../@types/CustomCommand";

import { ConfigureCommand } from "./Configure";
import { HelpCommand } from "./Help";
import { InviteCommand } from "./Invite";
import { VoteCommand } from "./Vote";

export const Commands: Array<CustomCommand> = [
  HelpCommand,
  InviteCommand,
  ConfigureCommand,
  VoteCommand,
];
