import { GrowingTokenBuffer } from "./growingTokenBuffer";
import { TokenizerRuleHit } from "./tokenizerRule";

export class TokenizerState {
  
  private characterStream: string;
  private streamPositon: number;
  private tokens: TokenizerRuleHit[];
  private currentCharacter: string | undefined;
  private characterPocket : GrowingTokenBuffer;

  public constructor(charStream: string){
    this.characterStream = charStream;
    this.tokens = [];
    this.streamPositon = 0;
    this.characterPocket = new GrowingTokenBuffer(128);
  }

  public advance() : string | undefined{
    if(this.streamPositon >= this.characterStream.length){
      return undefined;
    }
    this.currentCharacter = this.characterStream[++this.streamPositon];
    return this.currentCharacter;
  }

  public peek(){
    if(this.streamPositon >= this.characterStream.length){
      return undefined;
    }
    this.currentCharacter = this.characterStream[this.streamPositon];
    return this.currentCharacter;
  }

  public getCurrentCharacter(){
    return this.currentCharacter;
  }

  public addToPocket(character: string){
    this.characterPocket.push(character);
  }

  public getPocket(): string {
    return this.characterPocket.toString();
  }

  public resetPocket() {
    this.characterPocket.reset();
  }

  public getTokens(){
    return this.tokens;
  }

  public addToken(token: TokenizerRuleHit){
    this.tokens.push(token);
  }

}