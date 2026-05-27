// import classes
const CircuitBreaker = require("./CircuitBreaker");
const ExponentialBackoff = require("./ExponentialBackoff");

/**
 * Advanced retry executor with integrated Exponential Backoff
 * and Circuit Breaker protection.
 *
 * This class provides resilient execution for asynchronous
 * operations by combining:
 *
 * - Retry strategy using exponential backoff
 * - Circuit breaker failure protection
 * - Unified error handling
 * - Execution time tracking
 *
 * Useful for:
 * - API requests
 * - Database operations
 * - Network calls
 * - Third-party service integrations
 *
 * @class AdvanceRetrySystem
 */
class AdvanceRetrySystem {

    /**
     * Creates a new AdvanceRetrySystem instance.
     *
     * @constructor
     * @param {Object} [options={}] Configuration options.
     * @param {Object} [options.retry] Retry strategy configuration
     * passed to ExponentialBackoff.
     * @param {Object} [options.circuitBreaker] Circuit breaker
     * configuration passed to CircuitBreaker.
     */
    constructor (options = {}) {

        /**
         * Retry strategy instance responsible for
         * exponential backoff execution.
         *
         * @type {ExponentialBackoff}
         */
        this.retriever = new ExponentialBackoff(options.retry);

        /**
         * Circuit breaker instance responsible for
         * failure protection and state management.
         *
         * @type {CircuitBreaker}
         */
        this.circuitBreaker = new CircuitBreaker(options.circuitBreaker);
    }

     /**
     * Executes an asynchronous function with retry and
     * circuit breaker protection.
     *
     * Execution flow:
     * 1. Circuit breaker validates execution eligibility
     * 2. Retry strategy attempts execution
     * 3. Result is returned on success
     * 4. Failure is wrapped in RetryError
     *
     * @async
     * @template T
     * @param {() => Promise<T>} fn
     * Async function to execute.
     *
     * @returns {Promise<T>}
     * Resolves with the function result if execution succeeds.
     *
     * @throws {RetryError}
     * Throws RetryError when execution fails after retries
     * or is rejected by the circuit breaker.
     */
    async execute (fn) {
        const startTime = Date.now();
        let attempts = 0;

        try{
            return this.circuitBreaker.execute(async()=>{
                return this.retriever.execute(async()=>{
                    try{
                        const result = await fn();
                        return result;
                    }catch(err){
                        throw err;
                    }
                })
            })

        } catch (err) {
            throw new RetryError(err, attempts, Date.now() - startTime);
        }
    }
}

class RetryError extends Error {
    constructor(originalError, attempts, duration) {
        super(originalError.message);
        this.name = 'RetryError';
        this.originalError = originalError;
        this.attempts = attempts;
        this.duration = duration;
    }
}

module.exports = AdvanceRetrySystem;