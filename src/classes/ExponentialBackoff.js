/**
 * Exponential backoff retry strategy.
 *
 * Retries asynchronous operations using exponentially
 * increasing delays between attempts.
 *
 * Optional jitter can be enabled to introduce randomness
 * and reduce retry collisions during concurrent failures.
 *
 * Common use cases:
 * - API request retries
 * - Database reconnection
 * - Network instability handling
 * - Third-party service resilience
 *
 * @class ExponentialBackoff
 */
class ExponentialBackoff {

    /**
     * Creates an ExponentialBackoff instance.
     *
     * @constructor
     * @param {Object} [options={}] Retry configuration.
     * @param {number} [options.delay=1000]
     * Base delay in milliseconds before retrying.
     * @param {number} [options.maxRetries=3]
     * Maximum number of retry attempts.
     * @param {boolean} [options.jitter=false]
     * Enables randomized delay to avoid retry storms.
     */
    constructor(options = {}) {

        /**
         * Enables randomized retry delay.
         *
         * @type {boolean}
         */
        this.jitter = options.jitter ?? false;

        /**
         * Base retry delay in milliseconds.
         *
         * @type {number}
         */
        this.delay = options.delay ?? 1000;

        /**
         * Maximum retry attempts allowed.
         *
         * @type {number}
         */
        this.maxRetries = options.maxRetries ?? 5;

        /**
         * Current retry attempt counter.
         *
         * @type {number}
         */
        this.attempt = 0;
    }

    /**
     * Executes an asynchronous operation with
     * exponential backoff retry logic.
     *
     * Retry delay formula:
     *
     * delay × (2 ^ attempt)
     *
     * When jitter is enabled:
     *
     * random(0, delay × 2 ^ attempt)
     *
     * @async
     * @template T
     * @param {() => Promise<T>} fn
     * Async function to execute.
     *
     * @returns {Promise<T>}
     * Resolves with the successful result.
     *
     * @throws {Error}
     * Throws when maximum retries are exhausted.
     */
    async execute(fn) {

        while (this.attempt < this.maxRetries) {
            try {
                const result = await fn();

                // Reset attempt count after success
                this.attempt = 0;

                return result;

            } catch (err) {

                this.attempt++;

                if (this.attempt >= this.maxRetries) {
                    throw new Error(
                        "Maximum retry attempts reached"
                    );
                }

                const wait = this.jitter
                    ? Math.random() *
                      this.delay *
                      2 ** this.attempt
                    : this.delay *
                      2 ** this.attempt;

                await new Promise((resolve) =>
                    setTimeout(resolve, wait)
                );
            }
        }
    }
}

module.exports = ExponentialBackoff;