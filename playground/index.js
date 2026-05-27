// import 
const AdvanceRetrySystem = require("../src/index");

/**
 * Retry options
 */
const retryOptions = {
  jitter: true,
  delay: 2000,
  maxRetries: 5,
};

/**
 * Circuit breaker options
 */
const circuitBreakerOptions = {
  failureThreshold: 3,
  restTimeout: 60000,
};

/**
 * @instance
 * Instance of AdvanceRetrySystem
 */
const retry = new AdvanceRetrySystem({
  retriever: retryOptions,
  circuitBreaker: circuitBreakerOptions,
});

/**
 * Simulates an API request with random success/failure.
 *
 * @async
 * @function fakeApiCall
 * @returns {Promise<{status:number, message:string}>}
 * Resolves with a success response or rejects with an error response.
 */
async function fakeApiCall() {
  return new Promise((resolve, reject) => {
    const success = Math.random() > 0.5;
    const responseTime = Math.floor(Math.random() * 1000);

    setTimeout(() => {
      if (success) {
        resolve({
          status: 200,
          message: "API request successful",
        });
      } else {
        reject({
          status: 500,
          message: "Internal server error",
        });
      }
    }, responseTime);
  });
}

/**
 * Pass the functions as callback to retry execute
 */
await retry.execute(async () => {
  // trigger api
  fakeApiCall()
    .then(() => console.log("resolve"))
    .catch((err) => console.log("reject"));
});
