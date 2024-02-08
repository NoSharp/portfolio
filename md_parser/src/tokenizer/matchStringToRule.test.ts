import {describe, expect, test} from "@jest/globals";
import matchStringToRule from "./matchStringToRule";

describe("match string to rule", () => {
  test("it matches something", () => {
    const result = matchStringToRule("##", [
      {
        name: "Heading",
        pattern: /#+/g
      },
      {
        name: "Space",
        pattern: /\s+/g
      }
    ]);

    expect(result.some).toBeTruthy();
    expect(result.some && result.value.rule.name === "Heading" && result.value.content === "##").toBeTruthy();
  });

  test("it matches the other part of the rule set.", () => {
    const result = matchStringToRule(" ", [
      {
        name: "Heading",
        pattern: /#+/g
      },
      {
        name: "Space",
        pattern: /\s+/g
      }
    ]);

    expect(result.some).toBeTruthy();
    expect(result.some && result.value.rule.name === "Space" && result.value.content === " ").toBeTruthy();
  });
  
  test("it respects order of rules", () => {
    const result = matchStringToRule(" ", [
      {
        name: "I am first",
        pattern: /.+/g
      },
      {
        name: "I am second",
        pattern: /\.+/g
      }
    ]);

    expect(result.some).toBeTruthy();
    expect(result.some && result.value.rule.name === "I am first" && result.value.content === " ").toBeTruthy();
  });
});