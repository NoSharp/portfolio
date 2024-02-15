import {describe, expect, test} from "@jest/globals";
import Tokenizer from ".";
import { TokenizerState } from "./tokenizerState";

describe("tokenizer", () => {
  test("Groups Asterisks", () => {
    const tokenState = Tokenizer.start(new TokenizerState("***"));
    expect(tokenState.ok === true).toBeTruthy();
    if(!tokenState.ok) return;
    const tokens = tokenState.value[0].getTokens();

    expect(tokens.length === 1).toBeTruthy();
    expect(tokens[0].content === "***").toBeTruthy
  });
  test("Groups Text as String literal", () => {
    const tokenState = Tokenizer.start(new TokenizerState("Hello World!"));
    expect(tokenState.ok === true).toBeTruthy();
    if(!tokenState.ok) return;
    const tokens = tokenState.value[0].getTokens();
    expect(tokens.length === 12).toBeTruthy();
    expect(tokens[0].content === "H").toBeTruthy();
    expect(tokens[11].content === "!").toBeTruthy();
  });

  test("Groups Headers", () => {
    const tokenState = Tokenizer.start(new TokenizerState("###"));
    expect(tokenState.ok === true).toBeTruthy();
    if(!tokenState.ok) return;
    const tokens = tokenState.value[0].getTokens();

    expect(tokens.length === 1).toBeTruthy();
    expect(tokens[0].rule).toBe("HEADER");
    expect(tokens[0].content === "###").toBeTruthy();
  });
});