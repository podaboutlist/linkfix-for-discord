import BaseReplacement from "./BaseReplacement";

export default class TwitterReplacement extends BaseReplacement {
  constructor(newDomain: string) {
    super(
      newDomain,
      /https?:\/\/(x|twitter)\.com\/(\w){1,15}\/status\/[^\s]+/g,
      /(x|twitter)\.com\//,
    );
  }
}
