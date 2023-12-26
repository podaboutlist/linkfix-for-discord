/** Types generated for queries found in "src/bot/commands/Setup/setup.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type NumberOrString = number | string;

/** 'GetServerByGuildId' parameters type */
export interface IGetServerByGuildIdParams {
  guildId?: NumberOrString | null | void;
}

/** 'GetServerByGuildId' return type */
export interface IGetServerByGuildIdResult {
  id: number;
  /** Discord Guild ID */
  native_id: string;
}

/** 'GetServerByGuildId' query type */
export interface IGetServerByGuildIdQuery {
  params: IGetServerByGuildIdParams;
  result: IGetServerByGuildIdResult;
}

const getServerByGuildIdIR: any = {"usedParamSet":{"guildId":true},"params":[{"name":"guildId","required":false,"transform":{"type":"scalar"},"locs":[{"a":39,"b":46}]}],"statement":"SELECT * FROM guilds WHERE native_id = :guildId"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM guilds WHERE native_id = :guildId
 * ```
 */
export const getServerByGuildId = new PreparedQuery<IGetServerByGuildIdParams,IGetServerByGuildIdResult>(getServerByGuildIdIR);


