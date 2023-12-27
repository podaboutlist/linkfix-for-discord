import { CustomCommand } from "../@types/CustomCommand";
import { HelpCommand } from "./Help";
import { InviteCommand } from "./Invite";
import { VoteCommand } from "./Vote";

export const Commands: Array<CustomCommand> = [HelpCommand, InviteCommand, VoteCommand];
