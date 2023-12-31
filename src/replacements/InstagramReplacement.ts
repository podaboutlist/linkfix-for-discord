import BaseReplacement from "./BaseReplacement";

export default class InstagramReplacement extends BaseReplacement {
  constructor(newDomain: string) {
    super(
      newDomain,
      /https?:\/\/(\w+\.)?instagram\.com\/[^\s]+/g,
      /(\w+\.)?(instagram\.com\/)/,
    );
  }
}
