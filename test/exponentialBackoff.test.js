const ExponentialBackoff = require("../src/core/ExponentialBackoff");

describe("ExponentialBackoff", () => {
  test("should resolve on first attempt", async () => {
    const retry = new ExponentialBackoff({
      maxRetries: 3,
      delay: 10,
    });

    const fn = jest.fn().mockResolvedValue("success");

    const result = await retry.execute(fn);

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("should retry until success", async () => {
    const retry = new ExponentialBackoff({
      maxRetries: 3,
      delay: 10,
    });

    const fn = jest.fn()
      .mockRejectedValueOnce(new Error("fail1"))
      .mockRejectedValueOnce(new Error("fail2"))
      .mockResolvedValue("success");

    const result = await retry.execute(fn);

    expect(result).toBe("success");

    // 2 failures + 1 success = 3 total calls
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test("should throw after max retries", async () => {
    const retry = new ExponentialBackoff({
      maxRetries: 2,
      delay: 10,
    });

    const fn = jest.fn().mockRejectedValue(new Error("API down"));

    await expect(retry.execute(fn)).rejects.toThrow();

    // IMPORTANT: maxRetries=2 → 3 attempts total
    expect(fn).toHaveBeenCalledTimes(3);
  });
});