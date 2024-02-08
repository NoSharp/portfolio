import {describe, expect, test} from "@jest/globals";
import { GrowingTokenBuffer } from "./growingTokenBuffer";

describe("growing token buffer", () => {
  test("creates new token buffer of specified length", () => {
    const tokenBuffer = new GrowingTokenBuffer(128);
    expect(tokenBuffer).toBeTruthy();
    expect((tokenBuffer as any)["contentCapacity"]).toBe(128);
    expect(((tokenBuffer as any)["contents"] as Uint16Array).length).toBe(128);
  });

  test("push adds a new element into the array", () => {
    const tokenBuffer = new GrowingTokenBuffer(128);
    tokenBuffer.push("A");
    expect(((tokenBuffer as any)["contents"] as Uint16Array)[0]).toBe("A".charCodeAt(0));
  });

  test("push advances the current cursor position", () => {
    const tokenBuffer = new GrowingTokenBuffer(128);
    tokenBuffer.push("A");
    expect((tokenBuffer as any)["currentCursorPosition"] === 1).toBeTruthy();
  });

  test("pop removes an element", () => {
    const tokenBuffer = new GrowingTokenBuffer(128);
    tokenBuffer.push("A");
    const data = tokenBuffer.pop();
    expect(data.some).toBeTruthy();
    expect(data.some && data.value === "A");
  });

  test("pop reduces the cursor position", () => {
    const tokenBuffer = new GrowingTokenBuffer(128);
    tokenBuffer.push("A");
    tokenBuffer.pop();
    expect((tokenBuffer as any)["currentCursorPosition"] === 0).toBeTruthy();
  });

  test("push allocates extra space when we hit the end of the buffer", () => {
    const tokenBuffer = new GrowingTokenBuffer(1);
    tokenBuffer.push("A");
    expect((tokenBuffer as any)["contentCapacity"] === 1).toBeTruthy();
    tokenBuffer.push("A");
    expect((tokenBuffer as any)["contentCapacity"] === 8).toBeTruthy();
  });

  test("push does not allocate extra space when we dont hit the end of the buffer", () => {
    const tokenBuffer = new GrowingTokenBuffer(128);
    tokenBuffer.push("A");
    expect((tokenBuffer as any)["contentCapacity"] === 128).toBeTruthy();
    tokenBuffer.push("A");
    expect((tokenBuffer as any)["contentCapacity"] === 128).toBeTruthy();
  });

  test("Push throws an error if we use more than a single character", () => {
    const tokenBuffer = new GrowingTokenBuffer(128);
    const wasOK = tokenBuffer.push("ABC");
    expect(wasOK.ok).toBeFalsy();
  });


  test("Reset removes all content in the buffer", ()=>{
    const tokenBuffer = new GrowingTokenBuffer(128);
    tokenBuffer.push("A");
    tokenBuffer.reset();
    expect(tokenBuffer.pop().some).toBe(false);
  })
  
  test("toString converts buffer to and from string.", ()=>{
    const tokenBuffer = new GrowingTokenBuffer(128);
    tokenBuffer.push("A");
    expect(tokenBuffer.toString()).toBe("A");
  })
});
