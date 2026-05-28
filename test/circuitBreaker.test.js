const CircuitBreaker = require("../src/core/CircuitBreaker");

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

describe("CircuitBreaker", () => {
  test("should execute successfully", async () => {
    const cb = new CircuitBreaker({
      failureThreshold: 2,
      restTimeout: 100,
    });

    const fn = jest.fn().mockResolvedValue("ok");

    const result = await cb.execute(fn);

    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(cb.state).toBe("CLOSED");
  });

  test("should open circuit after failures", async () => {
    const cb = new CircuitBreaker({
      failureThreshold: 1,
      restTimeout: 1000,
    });

    const fn = jest.fn().mockRejectedValue(new Error("fail"));

    await expect(cb.execute(fn)).rejects.toThrow();

    // next call should be blocked immediately
    await expect(cb.execute(fn)).rejects.toThrow(/circuit breaker is open/i);

    expect(cb.state).toBe("OPEN");
  });

  test("should recover OPEN → HALF_OPEN → CLOSED", async () => {
    const cb = new CircuitBreaker({
      failureThreshold: 1,
      restTimeout: 50,
    });

    const failFn = jest.fn().mockRejectedValue(new Error("fail"));

    await expect(cb.execute(failFn)).rejects.toThrow();

    expect(cb.failures).toBe(1);

    await wait(60);

    const successFn = jest.fn().mockResolvedValue("recovered");

    const result = await cb.execute(successFn);

    expect(result).toBe("recovered");
    expect(cb.state).toBe("CLOSED");
  });
});