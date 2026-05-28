/**
 * Circuit breaker states.
 *
 * CLOSED:
 * Requests flow normally.
 *
 * OPEN:
 * Requests are blocked after reaching
 * failure threshold.
 *
 * HALF_OPEN:
 * Allows a trial request after timeout
 * to determine recovery status.
 *
 * @readonly
 * @enum {string}
 */
const CIRCUIT_STATE = {
    CLOSED: "CLOSED",
    HALF_OPEN: "HALF_OPEN",
    OPEN: "OPEN",
};

/**
 * Circuit Breaker implementation for fault tolerance
 * and service protection.
 *
 * Prevents repeated execution of failing operations by
 * temporarily opening the circuit after a configurable
 * number of failures.
 *
 * State transitions:
 *
 * CLOSED → OPEN
 * After reaching failure threshold.
 *
 * OPEN → HALF_OPEN
 * After timeout expires.
 *
 * HALF_OPEN → CLOSED
 * When trial execution succeeds.
 *
 * Common use cases:
 * - API protection
 * - Database connection resilience
 * - External service integrations
 * - Preventing cascading failures
 *
 * @class CircuitBreaker
 */
class CircuitBreaker {
    constructor(options = {}) {
        /**
         * Current circuit state.
         *
         * @type {string}
         */
        this.state = CIRCUIT_STATE.CLOSED;

         /**
         * Failure threshold before opening circuit.
         *
         * @type {number}
         */
        this.failureThreshold = options.failureThreshold || 5;

         /**
         * Recovery timeout duration in milliseconds.
         *
         * @type {number}
         */
        this.resetTimeout = options.resetTimeout || 1000;

        /**
         * Current failure count.
         *
         * @type {number}
         */
        this.failures = 0;

        /**
         * Timestamp of last failure.
         *
         * @type {?number}
         */
        this.lastFailureTime = null;
    }

    /**
     * Executes an asynchronous operation under
     * circuit breaker protection.
     *
     * Execution flow:
     *
     * 1. CLOSED:
     *    Executes normally.
     *
     * 2. OPEN:
     *    Rejects execution until timeout expires.
     *
     * 3. HALF_OPEN:
     *    Allows a trial execution.
     *
     * Successful HALF_OPEN execution resets
     * failure count and closes the circuit.
     *
     * Failed execution increments failure count
     * and may reopen the circuit.
     *
     * @async
     * @template T
     * @param {() => Promise<T>} fn
     * Async operation to execute.
     *
     * @returns {Promise<T>}
     * Resolves with execution result.
     *
     * @throws {Error}
     * Throws when:
     * - Circuit is OPEN
     * - Execution fails
     */
    async execute(fn) {
        if (this.state === CIRCUIT_STATE.OPEN) {
            if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
                this.state = CIRCUIT_STATE.HALF_OPEN;
            } else {
                throw new Error('Circuit breaker is OPEN');
            }
        }

        try {
            const result = await fn();
            if (this.state === CIRCUIT_STATE.HALF_OPEN) {
                this.state = CIRCUIT_STATE.CLOSED;
                this.failures = 0;
            }
            return result;
        } catch (error) {
            this.failures++;
            this.lastFailureTime = Date.now();

            if (this.failures >= this.failureThreshold) {
                this.state = CIRCUIT_STATE.OPEN;
            }
            throw error;
        }
    }
}

module.exports = CircuitBreaker;