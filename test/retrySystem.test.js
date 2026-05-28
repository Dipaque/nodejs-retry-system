const RetrySystem = require("../src/index");

describe("RetrySystem", () => {
  test("should retry and succeed", async () => {
    const retry = new RetrySystem({
      retry: { maxRetries: 3, delay: 10 },
      circuitBreaker: { failureThreshold: 5, restTimeout: 100 },
    });

    const fn = jest.fn()
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValue("success");

    const result = await retry.execute(fn);

    expect(result).toBe("success");
  });

  test("should fail after retries exhausted", async () => {
    const retry = new RetrySystem({
      retry: { maxRetries: 2, delay: 10 },
      circuitBreaker: { failureThreshold: 5, restTimeout: 100 },
    });

    const fn = jest.fn().mockRejectedValue(new Error("server error"));

    await expect(retry.execute(fn)).rejects.toThrow("server error");
  });

  test("should open circuit breaker after threshold", async () => {
    const retry = new RetrySystem({
      retry: { maxRetries: 1, delay: 10 },
      circuitBreaker: { failureThreshold: 1, restTimeout: 1000 },
    });

    const fn = jest.fn().mockRejectedValue(new Error("failure"));

    // first call triggers failure
    await expect(retry.execute(fn)).rejects.toThrow();

    // second call should be blocked by circuit breaker
    await expect(retry.execute(fn)).rejects.toThrow(/circuit breaker is open/i);
  });
});