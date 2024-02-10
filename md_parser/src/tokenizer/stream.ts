export interface ICharacterStream {
  takeCharacter(): string | undefined; // Not using Option Here because it'll be too slow.
}