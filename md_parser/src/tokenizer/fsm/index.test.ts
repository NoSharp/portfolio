import { describe, expect, test } from "@jest/globals";
import { FSM } from ".";

type STATES = "START" | "STOP" | "HALT";

describe("Finite State Machine", () => {
  test("it correctly passes arguments through the machine", () => {
    const FSMTest = new FSM<[number], STATES, "START", "STOP"> ("START", "STOP")
      .addState("START", (amount: number) => {
        return ["HALT", amount + 10];
      })
      .addState("HALT", (amount: number) => {
        return ["STOP", amount];
      });
    
    const result = FSMTest.start(10);

    expect(result.ok && result.value[0] === 20);
  });

  test("it prevents going to the start state", () => {
    const FSMTest = new FSM<[number], STATES, "START", "STOP"> ("START", "STOP")
      .addState("START", (amount: number) => {
        return ["HALT", amount + 10];
      })
      .addState("HALT", (amount: number) => {
        return ["START", amount];
      });
    
    const result = FSMTest.start(10);

    expect(!result.ok && result.error.name === "InaccessibleState");
  });

  test("it fails at an undefined state", () => {
    const FSMTest = new FSM<[number], STATES, "START", "STOP"> ("START", "STOP")
      .addState("START", (amount: number) => {
        return ["" as unknown as STATES, amount + 10];
      })
      .addState("HALT", (amount: number) => {
        return ["START", amount];
      });
    
    const result = FSMTest.start(10);

    expect(!result.ok && result.error.name === "UndefinedState");
  });
});
