# Nodejs Advanced Retry System

A lightweight and resilient retry library for Node.js featuring:

- Exponential Backoff
- Optional Jitter
- Circuit Breaker Pattern
- Retry Metrics
- Custom Retry Errors
- Promise-based API
- Production-ready fault tolerance

Perfect for:

- API requests
- Database operations
- External service calls
- Network retry strategies
- Preventing cascading failures

---

## Installation

```bash
npm install node-retry-system
```

---

## Features

✅ Exponential backoff retry strategy  
✅ Optional jitter support  
✅ Circuit breaker protection  
✅ Custom retry error handling  
✅ Promise-based execution  
✅ Lightweight and dependency-free

---

## Quick Start

### Basic Retry

```js
const {
  RetrySystem
} = require("node-retry-system");

const retry = new RetrySystem({
  retry: {
    delay: 1000,
    maxRetries: 3,
    jitter: true
  },
  circuitBreaker: {
    failureThreshold: 5,
    restTimeout: 10000
  }
});

async function fetchData() {
  return "Success";
}

(async () => {
  try {
    const result = await retry.execute(fetchData);
    console.log(result);
  } catch (err) {
    console.error(err);
  }
})();
```

---

## Retry Example

Simulating an unstable API.

```js
const {
  RetrySystem
} = require("node-retry-system");

const retry = new RetrySystem({
  retry: {
    delay: 1000,
    maxRetries: 5,
    jitter: true
  }
});

async function fakeApiCall() {
  return new Promise((resolve, reject) => {
    const success = Math.random() > 0.5;

    setTimeout(() => {
      if (success) {
        resolve({
          status: 200,
          message: "API request successful"
        });
      } else {
        reject({
          status: 500,
          message: "Server error"
        });
      }
    }, 500);
  });
}

(async () => {
  try {
    const response = await retry.execute(
      async () => await fakeApiCall()
    );

    console.log(response);
  } catch (err) {
    console.error(err);
  }
})();
```

---

# API Reference

---

## RetrySystem

Combines:

- Exponential Backoff
- Circuit Breaker
- Retry Error Handling

### Constructor

```js
new RetrySystem(options)
```

### Options

| Property | Type | Description |
|---|---|---|
| retry | Object | Retry strategy configuration |
| circuitBreaker | Object | Circuit breaker configuration |

### Execute

```js
await retry.execute(fn)
```

| Param | Type | Description |
|---|---|---|
| fn | Function | Async function to execute |

Returns:

```js
Promise<T>
```

Throws:

```js
RetryError
```

---

## ExponentialBackoff

Retry strategy using exponentially increasing delays.

### Constructor

```js
new ExponentialBackoff(options)
```

### Options

| Property | Type | Default | Description |
|---|---|---|---|
| delay | number | 1000 | Base retry delay (ms) |
| maxRetries | number | 3 | Maximum retry attempts |
| jitter | boolean | false | Randomized delay |

### Delay Formula

Without jitter:

```text
delay × (2 ^ attempt)
```

With jitter:

```text
random(0, delay × 2 ^ attempt)
```

---

## CircuitBreaker

Protects failing services from repeated execution.

### States

| State | Description |
|---|---|
| CLOSED | Requests flow normally |
| OPEN | Requests blocked |
| HALF_OPEN | Trial execution allowed |

### Constructor

```js
new CircuitBreaker(options)
```

### Options

| Property | Type | Default | Description |
|---|---|---|---|
| failureThreshold | number | 5 | Failures before OPEN |
| restTimeout | number | 10000 | Recovery timeout |

---

## RetryError

Custom error containing retry execution details.

Example:

```js
try {
  await retry.execute(fn);
} catch (err) {
  console.log(err.message);
  console.log(err.attempts);
  console.log(err.duration);
}
```

---

# How It Works

Execution flow:

```text
Request
   │
   ▼
Circuit Breaker
   │
   ▼
Exponential Backoff Retry
   │
   ▼
Success / RetryError
```

### Retry Lifecycle

```text
Attempt 1 → Fail
      ↓
Wait (Backoff)
      ↓
Attempt 2 → Fail
      ↓
Wait (Backoff)
      ↓
Attempt 3 → Success
```

Circuit breaker lifecycle:

```text
CLOSED
   ↓
Failures exceed threshold
   ↓
OPEN
   ↓
Timeout expires
   ↓
HALF_OPEN
   ↓
Success → CLOSED
Failure → OPEN
```

---

## Error Handling

Example:

```js
try {
  await retry.execute(fetchUsers);
} catch (err) {
  console.error(
    "Operation failed after retries",
    err
  );
}
```

---

## Use Cases

This package is useful for:

- REST API retry handling
- Payment gateway requests
- Database reconnection logic
- Third-party service integrations
- Microservice communication
- Network fault tolerance

---

## Development

Clone repository:

```bash
git clone [https://github.com/Dipaque/nodejs-retry-system](https://github.com/Dipaque/nodejs-retry-system)
```

Install dependencies:

```bash
npm install
```

Run tests:

```bash
npm test
```

---

## License

MIT License.

---

## Contributing

Contributions, issues, and feature requests are welcome.

Feel free to open a pull request or create an issue.

---

## Author

Deepak R

GitHub: [Deepak R](https://github.com/Dipaque)
