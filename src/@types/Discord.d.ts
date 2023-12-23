import { Collection } from "discord.js";
import { CustomCommand } from "./CustomCommand";

// extend discord.js Client type to allow commands collection
declare module "discord.js" {
  export interface Client {
    commands: Collection<string, CustomCommand>;
  }
}
