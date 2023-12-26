import BaseReplacement from "./BaseReplacement";

export default class YouTubeReplacement extends BaseReplacement {
  constructor(newDomain: string) {
    super(
      newDomain,
      /https?:\/\/(www\.)?youtube\.com\/shorts\/[^\s]+/g,
      /(www\.)?(youtube\.com\/shorts\/)/,
    );
  }
}
