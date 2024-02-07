import { GrowingTokenBuffer } from "./growingTokenBuffer";

export class Tokenizer {

  private tokenBuffer: GrowingTokenBuffer;

  constructor(){
    this.tokenBuffer = new GrowingTokenBuffer();
  }

  addRule(){
  }

  tokenize(){} 
}