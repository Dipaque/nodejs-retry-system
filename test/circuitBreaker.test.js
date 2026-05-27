const CircuitBreaker =
    require("../src/classes/CircuitBreaker");

describe("CircuitBreaker", () => {

    test(
        "should execute successfully",
        async () => {

            const cb =
                new CircuitBreaker({
                    failureThreshold: 2,
                    restTimeout: 100
                });

            const fn =
                jest.fn()
                    .mockResolvedValue(
                        "ok"
                    );

            const result =
                await cb.execute(fn);

            expect(result)
                .toBe("ok");

            expect(fn)
                .toHaveBeenCalledTimes(1);
        }
    );

    test(
        "should open circuit after failures",
        async () => {

            const cb =
                new CircuitBreaker({
                    failureThreshold: 2,
                    restTimeout: 1000
                });

            const fn =
                jest.fn()
                    .mockRejectedValue(
                        Error("fail")
                    );

            await expect(
                cb.execute(fn)
            ).rejects.toThrow();

            await expect(
                cb.execute(fn)
            ).rejects.toThrow();

            expect(cb.state)
                .toBe("OPEN");
        }
    );

    test(
        "should move to HALF_OPEN and close on success",
        async () => {

            const cb =
                new CircuitBreaker({
                    failureThreshold: 1,
                    restTimeout: 50
                });

            const failFn =
                jest.fn()
                    .mockRejectedValue(
                        Error("fail")
                    );

            await expect(
                cb.execute(failFn)
            ).rejects.toThrow();

            expect(cb.state)
                .toBe("OPEN");

            await new Promise(
                r => setTimeout(r, 60)
            );

            const successFn =
                jest.fn()
                    .mockResolvedValue(
                        "recovered"
                    );

            const result =
                await cb.execute(
                    successFn
                );

            expect(result)
                .toBe("recovered");

            expect(cb.state)
                .toBe("CLOSED");
        }
    );
});