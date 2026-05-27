const AdvanceRetrySystem =
    require("../src/classes/AdvanceRetrySystem");

describe(
    "AdvanceRetrySystem",
    () => {

    test(
        "should retry and succeed",
        async () => {

            const retry =
                new AdvanceRetrySystem({
                    retry: {
                        maxRetries: 3,
                        delay: 10
                    },
                    circuitBreaker: {
                        failureThreshold: 5,
                        restTimeout: 100
                    }
                });

            const fn = jest.fn()
                .mockRejectedValueOnce(
                    Error("fail")
                )
                .mockResolvedValue(
                    "success"
                );

            const result =
                await retry.execute(fn);

            expect(result)
                .toBe("success");

            expect(fn)
                .toHaveBeenCalledTimes(2);
        }
    );

    test(
        "should throw RetryError after failure",
        async () => {

            const retry =
                new AdvanceRetrySystem({
                    retry: {
                        maxRetries: 2,
                        delay: 10
                    },
                    circuitBreaker: {
                        failureThreshold: 2,
                        restTimeout: 100
                    }
                });

            const fn =
                jest.fn()
                    .mockRejectedValue(
                        Error("server error")
                    );

            await expect(
                retry.execute(fn)
            ).rejects.toBeInstanceOf(
                Error
            );

            expect(fn)
                .toHaveBeenCalledTimes(2);
        }
    );

    test(
        "should open circuit after threshold",
        async () => {

            const retry =
                new AdvanceRetrySystem({
                    retry: {
                        maxRetries: 1,
                        delay: 10
                    },
                    circuitBreaker: {
                        failureThreshold: 1,
                        restTimeout: 1000
                    }
                });

            const fn =
                jest.fn()
                    .mockRejectedValue(
                        Error("failure")
                    );

            await expect(
                retry.execute(fn)
            ).rejects.toThrow();

            await expect(
                retry.execute(fn)
            ).rejects.toThrow(
                "Circuit breaker is OPEN"
            );
        }
    );
});