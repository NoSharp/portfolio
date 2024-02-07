import assert from "node:assert";
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
  private contents: Uint16Array;
  private currentCursorPosition: number;
  private contentCapacity: number;

  constructor(startingSize: number = 1024) {
    this.contents = new Uint16Array(startingSize);
    this.contentCapacity = startingSize;
    this.currentCursorPosition = 0;
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

    return Some(
      String.fromCharCode(this.contents[this.currentCursorPosition--])
    );
  }

  private allocateMoreCapacity() {
    const newSize = new Uint16Array(this.contentCapacity * 8);
    newSize.set(this.contents.slice(0, this.contentCapacity), 0);
    this.contents = newSize;
    this.contentCapacity = this.contentCapacity * 8;
  }
}
