import { None, Option, Some } from "../optional";
import { BaseError, Err, Ok, Result } from "../result";

export interface PushArgumentMustBeAChar extends BaseError {
  name: "PushArgumentMustBeAChar";
}

function PushArgumentMustBeAChar(): Err<PushArgumentMustBeAChar> {
  return Err({
    name: "PushArgumentMustBeAChar",
  });
}

export class GrowingTokenBuffer {
  private contents: Uint8Array;
  private currentCursorPosition: number;
  private contentCapacity: number;
  private textDecoder: TextDecoder

  constructor(startingSize: number = 1024) {
    this.contents = new Uint8Array(startingSize);
    this.contentCapacity = startingSize;
    this.currentCursorPosition = 0;
    this.textDecoder = new TextDecoder("utf-8");
  }

  public push(val: string): Result<undefined, PushArgumentMustBeAChar> {
    if(val.length !== 1){
      return PushArgumentMustBeAChar();
    }

    if (this.currentCursorPosition >= this.contentCapacity) {
      this.allocateMoreCapacity();
    }

    this.contents[this.currentCursorPosition] = val.charCodeAt(0);
    this.currentCursorPosition++;
    return Ok(undefined);
  }

  public pop(): Option<string> {
    if (this.currentCursorPosition >= this.contentCapacity) {
      return None();
    }

    if(this.currentCursorPosition === 0){
      return None();
    }

    return Some(
      String.fromCharCode(this.contents[this.currentCursorPosition--])
    );
  }

  public reset() {
    // Although unsafe, we don't discard the current buffer
    // we can instead just reset the cursor position to avoid
    // accessing previously discarded information.
    this.currentCursorPosition = 0;
  }

  public toString(){
    return this.textDecoder.decode(this.contents.slice(0, this.currentCursorPosition));
  }

  private allocateMoreCapacity() {
    const newSize = new Uint8Array(this.contentCapacity * 8);
    newSize.set(this.contents.slice(0, this.contentCapacity), 0);
    this.contents = newSize;
    this.contentCapacity = this.contentCapacity * 8;
  }
}
