import {describe, expect, test} from "@jest/globals";
import Tokenizer from ".";
import { TokenizerState } from "./tokenizerState";

describe("tokenizer", () => {
  test("Groups Asterisks", () => {
    const tokenState = Tokenizer.start(new TokenizerState("***"));
    expect(tokenState.ok === true).toBeTruthy();
    if(!tokenState.ok) return;
    const tokens = tokenState.value[0].getTokens();

    expect(tokens.length).toBe(1);
    expect(tokens[0].content).toBe("***");
  });
  test("Groups Text as String literal", () => {
    const tokenState = Tokenizer.start(new TokenizerState("Hello World!"));
    expect(tokenState.ok === true).toBeTruthy();
    if(!tokenState.ok) return;
    const tokens = tokenState.value[0].getTokens();
    expect(tokens.length).toBe(12);
    expect(tokens[0].content).toBe("H");
    expect(tokens[11].content).toBe("!");
  });

  test("Groups Headers", () => {
    const tokenState = Tokenizer.start(new TokenizerState("###"));
    expect(tokenState.ok === true).toBeTruthy();
    if(!tokenState.ok) return;
    const tokens = tokenState.value[0].getTokens();

    expect(tokens.length).toBe(1);
    expect(tokens[0].rule).toBe("HEADER");
    expect(tokens[0].content).toBe("###");
  });
});