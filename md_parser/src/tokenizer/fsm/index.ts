// const FSM = new FSM<string>()
//   .addState("START", (fsm: FSM, arg: string)=>{
//     fsm.setState("START", arg (subtract current character))
//   });

import { None, Some, Option } from "../../optional";
import { BaseError, Err, Ok, Result } from "../../result";

type ValueOf<T extends readonly string[]> = keyof DropNumberValues<{
  readonly [Key in keyof T as T[Key] extends string ? T[Key] : never]: T[Key];
}>;

type DropNumberValues<T extends { [key: string | number]: string | number }> = {
  [Key in keyof T as Key extends number ? never : Key]: T[Key];
};

type ExceptFor<T, E extends T, S extends T> = S ;

export interface UndefinedState extends BaseError {
  name: "UndefinedState";
  state: string;
}

function UndefinedState(state: string): Err<UndefinedState> {
  return Err({
    name: "UndefinedState",
    state,
  });
}

export interface InaccessibleState extends BaseError {
  name: "InaccessibleState";
  state: string;
}

function InaccessibleState(state: string): Err<InaccessibleState> {
  return Err({
    name: "InaccessibleState",
    state,
  });
}

export class FSM<T extends unknown[], K extends string, S extends Exclude<K, U>, U extends K> {
  private states: Map<K, (...args: T) => [K, ...T]>;
  private terminatorState: U;
  private startState: S;

  constructor(startState: S, terminatorState: U) {
    this.states = new Map();
    this.startState = startState;
    this.terminatorState = terminatorState;
  }

  public addState(targetState: K, callback: (...args: T) => [K, ...T]) {
    this.states.set(targetState, callback);
    return this;
  }

  public start(...args: T): Result<T, UndefinedState | InaccessibleState> {
    let state = this.startState;
    let stateToCall = this.states.get(state);
    if (stateToCall === undefined) {
      return UndefinedState(state);
    }

    let stateRes = stateToCall(...args);
    let nextState: K = stateRes[0] as K;
    let otherArgs = stateRes.splice(1, 1);
    let nextArgs : T = otherArgs as T;
    while (!this.isTerminator(nextState)) {
      stateToCall = this.states.get(nextState);
      if (stateToCall === undefined) {
        return UndefinedState(state);
      }

      let stateRes = stateToCall(...args);
      nextState = stateRes[0] as K;
      let otherArgs = stateRes.splice(1, 1);
      nextArgs = otherArgs as T;

      if(this.isStart(nextState)){
        return InaccessibleState(nextState);
      }
    }

    return Ok(nextArgs);
  }
  
  private isTerminator(stateName: K): stateName is U {
    return stateName === this.terminatorState;
  }

  private isStart(stateName: K): stateName is S {
    return stateName === (this.startState as unknown as K);
  }
}


