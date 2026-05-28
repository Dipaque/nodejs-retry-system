/**
 * Playground: RetrySystem + CircuitBreaker behavior simulation
 *
 * This script simulates:
 * - Normal traffic (initial failures)
 * - Short pause window
 * - Recovery attempt after circuit breaker opens
 *
 * Purpose:
 * - Verify retry + circuit breaker integration
 * - Observe OPEN → HALF_OPEN → CLOSED transitions
 * - Validate failure thresholds and rest timeout behavior
 */

// import library
const RetrySystem = require("../src/index");

/**
 * Create retry system instance
 */
const retry = new RetrySystem({
  retry: {
    delay: 500,
    maxRetries: 2,
    jitter: false,
  },
  circuitBreaker: {
    failureThreshold: 3,
    restTimeout: 1000,
  },
});

/**
 * Fake API that always fails
 * Used to force circuit breaker activation
 */
async function fakeApiCall() {
  throw new Error("API failed");
}

/**
 * Utility: sleep function
 * @param {number} ms
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Runs playground simulation
 */
async function run() {
  for (let i = 1; i <= 10; i++) {
    console.log(`\n=== REQUEST ${i} ===`);

    /**
     * Phase 1: initial burst (force failures quickly)
     */
    if (i <= 3) {
      await executeRequest(i, 0);
    }

    /**
     * Phase 2: short pause (simulate normal traffic gap)
     */
    else if (i <= 5) {
      await sleep(500);
      await executeRequest(i, 500);
    }

    /**
     * Phase 3: recovery phase (circuit breaker cooldown window)
     */
    else {
      await sleep(3000);
      await executeRequest(i, 3000);
    }
  }
}

/**
 * Executes a single retry-protected request
 *
 * @param {number} requestId
 * @param {number} delay
 */
async function executeRequest(requestId, delay) {
  try {
    const result = await retry.execute(async () => {
      return await fakeApiCall();
    });

    console.log(`REQUEST ${requestId} SUCCESS:`, result);
  } catch (err) {
    console.log(`REQUEST ${requestId} FAILED:`, err.message);
  }

  if (delay) {
    console.log(`(waited ${delay}ms before execution)`);
  }
}

// run playground
run();