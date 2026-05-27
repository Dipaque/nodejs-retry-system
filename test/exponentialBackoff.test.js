const ExponentialBackoff =
    require("../src/classes/ExponentialBackoff");

describe("ExponentialBackoff", () => {

    test(
        "should resolve on first attempt",
        async () => {

            const retry =
                new ExponentialBackoff({
                    maxRetries: 3,
                    delay: 10
                });

            const fn =
                jest.fn()
                    .mockResolvedValue("success");

            const result =
                await retry.execute(fn);

            expect(result)
                .toBe("success");

            expect(fn)
                .toHaveBeenCalledTimes(1);
        }
    );

    test(
        "should retry until success",
        async () => {

            const retry =
                new ExponentialBackoff({
                    maxRetries: 3,
                    delay: 10
                });

            const fn = jest.fn()
                .mockRejectedValueOnce(
                    Error("fail1")
                )
                .mockRejectedValueOnce(
                    Error("fail2")
                )
                .mockResolvedValue(
                    "success"
                );

            const result =
                await retry.execute(fn);

            expect(result)
                .toBe("success");

            expect(fn)
                .toHaveBeenCalledTimes(3);
        }
    );

    test(
        "should throw after max retries",
        async () => {

            const retry =
                new ExponentialBackoff({
                    maxRetries: 2,
                    delay: 10
                });

            const fn = jest.fn()
                .mockRejectedValue(
                    Error("API down")
                );

            await expect(
                retry.execute(fn)
            ).rejects.toThrow(
                "Maximum retry attempts reached"
            );

            expect(fn)
                .toHaveBeenCalledTimes(2);
        }
    );
});