import BaseReplacement from "./BaseReplacement";

export default class BskyReplacement extends BaseReplacement {
  constructor(newDomain: string) {
    super(
      newDomain,
      // plc is 24 chars
      // https://github.com/did-method-plc/did-method-plc?tab=readme-ov-file#identifier-syntax
      // TID length is always 13 ASCII characters
      // https://atproto.com/specs/record-key#record-key-type-tid
      /https?:\/\/bsky\.app\/profile\/((\w|\.|-)+|(did:plc:[234567a-z]{24}))\/post\/[234567a-z]{13}(?!\/)/g,
      /bsky\.app\//,
    );
  }
}
