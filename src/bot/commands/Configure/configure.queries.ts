/** Types generated for queries found in "src/bot/commands/Configure/configure.sql" */
// @ts-expect-error moduleResolution
import { PreparedQuery } from '@pgtyped/runtime';

export type NumberOrString = number | string;

/** 'GetServerByGuildId' parameters type */
export interface IGetServerByGuildIdParams {
  guildId?: NumberOrString | null | void;
}

/** 'GetServerByGuildId' return type */
export interface IGetServerByGuildIdResult {
  /** Discord Server ID */
  discord_native_id: string;
  id: number;
}

/** 'GetServerByGuildId' query type */
export interface IGetServerByGuildIdQuery {
  params: IGetServerByGuildIdParams;
  result: IGetServerByGuildIdResult;
}

const getServerByGuildIdIR: any = {"usedParamSet":{"guildId":true},"params":[{"name":"guildId","required":false,"transform":{"type":"scalar"},"locs":[{"a":47,"b":54}]}],"statement":"SELECT * FROM guilds WHERE discord_native_id = :guildId"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM guilds WHERE discord_native_id = :guildId
 * ```
 */
export const getServerByGuildId = new PreparedQuery<IGetServerByGuildIdParams,IGetServerByGuildIdResult>(getServerByGuildIdIR);
