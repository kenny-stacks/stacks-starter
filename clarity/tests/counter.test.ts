import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { initSimnet } from "@stacks/clarinet-sdk";

const simnet = await initSimnet();

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;

describe("counter contract", () => {
  it("get-count returns initial value of 0", () => {
    const response = simnet.callReadOnlyFn(
      "counter",
      "get-count",
      [],
      deployer,
    );
    expect(response.result).toBeOk(Cl.uint(0));
  });

  it("increment increases counter by 1 and returns new value", () => {
    const response = simnet.callPublicFn("counter", "increment", [], deployer);
    expect(response.result).toBeOk(Cl.uint(1));

    // Verify the value persisted
    const getResponse = simnet.callReadOnlyFn(
      "counter",
      "get-count",
      [],
      deployer,
    );
    expect(getResponse.result).toBeOk(Cl.uint(1));
  });

  it("increment can be called multiple times", () => {
    // Call increment 5 times and verify final value
    simnet.callPublicFn("counter", "increment", [], deployer);
    simnet.callPublicFn("counter", "increment", [], deployer);
    simnet.callPublicFn("counter", "increment", [], deployer);
    simnet.callPublicFn("counter", "increment", [], deployer);
    const response = simnet.callPublicFn("counter", "increment", [], deployer);

    expect(response.result).toBeOk(Cl.uint(5));

    const getResponse = simnet.callReadOnlyFn(
      "counter",
      "get-count",
      [],
      deployer,
    );
    expect(getResponse.result).toBeOk(Cl.uint(5));
  });

  it("decrement decreases counter by 1 and returns new value", () => {
    // First increment to get above 0
    simnet.callPublicFn("counter", "increment", [], deployer);
    simnet.callPublicFn("counter", "increment", [], deployer);

    // Verify counter is at 2
    const checkResponse = simnet.callReadOnlyFn(
      "counter",
      "get-count",
      [],
      deployer,
    );
    expect(checkResponse.result).toBeOk(Cl.uint(2));

    // Now decrement
    const response = simnet.callPublicFn("counter", "decrement", [], deployer);
    expect(response.result).toBeOk(Cl.uint(1));

    const getResponse = simnet.callReadOnlyFn(
      "counter",
      "get-count",
      [],
      deployer,
    );
    expect(getResponse.result).toBeOk(Cl.uint(1));
  });

  it("decrement fails with err-underflow when counter is 0", () => {
    // Verify counter starts at 0
    const getResponse = simnet.callReadOnlyFn(
      "counter",
      "get-count",
      [],
      deployer,
    );
    expect(getResponse.result).toBeOk(Cl.uint(0));

    // Attempt to decrement below 0 should fail
    const response = simnet.callPublicFn("counter", "decrement", [], deployer);
    expect(response.result).toBeErr(Cl.uint(1)); // err-underflow = u1
  });
});
