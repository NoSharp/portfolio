import { None, Option, Some } from "../optional";
import { TokenizerRule, TokenizerRuleHit } from "./tokenizerRule";

export default function matchStringToRule(input: string, rules: TokenizerRule[]): Option<TokenizerRuleHit>{
  // enforce order of array
  for(let i = 0; i < rules.length; i++){
    const rule = rules[i];
    if(rule.pattern.test(input)){
      return Some({
        rule,
        content: input
      })
    }
  }

  return None();
}