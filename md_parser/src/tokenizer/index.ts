import { FSM } from "./fsm";
import { TokenizerRuleHit } from "./tokenizerRule";
import { TokenizerState } from "./tokenizerState";

type STATES = "START" | "SEARCHING" | "CHARACTER" | "BOLD" | "ITALIC" | "ASTERISK" | "HEADER" | "STOP";

const Tokenizer = new FSM<[TokenizerState], STATES, "START", "STOP">("START", "STOP")
  .addState("START", (tokenizerState: TokenizerState) => {
    return ["CHARACTER", tokenizerState]
  })
  .addState("ASTERISK", (tokenizerState: TokenizerState) => {
    let char = tokenizerState.advance();
    while (char === '*'){
      tokenizerState.addToPocket(char);
      char = tokenizerState.advance();
    }

    const newHit: TokenizerRuleHit = {
      rule: "ASTERISK",
      content: tokenizerState.getPocket()
    }

    tokenizerState.resetPocket();
    tokenizerState.addToken(newHit);

    return ["CHARACTER", tokenizerState];
  })
  .addState("HEADER", (tokenizerState: TokenizerState) => {
    let char = tokenizerState.advance();
    while (char === '#'){
      tokenizerState.addToPocket(char);
      char = tokenizerState.advance();
    }
    const newHit: TokenizerRuleHit = {
      rule: "HEADER",
      content: tokenizerState.getPocket()
    }

    console.log(newHit);

    tokenizerState.resetPocket();
    tokenizerState.addToken(newHit);

    return ["CHARACTER", tokenizerState];
  })
  .addState("CHARACTER", (tokenizerState: TokenizerState) => {
    const char = tokenizerState.peek();
    
    switch(char){
      // Start of a heading state.
      case "#": 
        return ["HEADER", tokenizerState];
      case "*": 
        return ["ASTERISK", tokenizerState];
      default:
        if(char === undefined){
          return ["STOP", tokenizerState];
        }
        tokenizerState.addToken({
          rule: "CHARACTER", 
          content: char
        });
        tokenizerState.advance();
        return ["CHARACTER", tokenizerState];
    }
  })

export default Tokenizer;