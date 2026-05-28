# 📁 Playground — RetrySystem

This folder contains **manual test scripts** to simulate and observe how the `RetrySystem` behaves under real-world failure conditions.

It helps you validate:

* Retry mechanism (Exponential Backoff)
* Circuit Breaker state transitions
* Failure thresholds
* Recovery behavior after timeout

---

# 🚀 Purpose

The playground is **not part of the production library**.

It is used for:

* Debugging retry behavior
* Observing circuit breaker OPEN / HALF_OPEN / CLOSED states
* Simulating unstable APIs
* Testing resilience under controlled failure scenarios

---

# 🧠 What is being tested?

This playground verifies:

### 1. Retry System

* Automatic retries on failure
* Exponential delay between attempts
* Maximum retry limits

### 2. Circuit Breaker

* Opens after failure threshold
* Blocks requests when OPEN
* Moves to HALF_OPEN after timeout
* Recovers when request succeeds

---

# 📦 Files

| File                                   | Purpose                 |
| -------------------------------------- | ----------------------- |
| `playground.js`                        | Main test runner        |

---

# ⚙️ Configuration Used

```js
retry: {
  delay: 500,
  maxRetries: 2,
  jitter: false,
},

circuitBreaker: {
  failureThreshold: 3,
  restTimeout: 1000,
}
```

---

# ▶️ How to Run

From project root:

```bash
node playground/playground.js
```

---

# 📊 Expected Behavior

### Phase 1 — Initial Failures

* API fails repeatedly
* Retry attempts are triggered
* Circuit breaker increments failure count

---

### Phase 2 — Circuit Breaker Opens

When failure threshold is reached:

```
[Circuit Breaker] OPEN state triggered
```

* All requests are blocked
* No retry execution happens

---

### Phase 3 — Recovery Window (HALF_OPEN)

After `restTimeout` expires:

* Circuit breaker allows a trial request
* If success → CLOSED
* If failure → OPEN again

---

# 🔥 Key Observations

When running playground, you should observe:

* Retry attempts per request
* Increasing failure count in circuit breaker
* Transition: CLOSED → OPEN → HALF_OPEN → CLOSED
* Blocked requests during OPEN state

---

# ⚠️ Important Notes

* This is **intentional failure simulation**
* `fakeApiCall()` always throws errors
* Behavior may vary based on timing and retry configuration
* Used only for debugging and validation

---

# 🧪 Suggested Experiments

Try modifying:

### 1. Increase failure threshold

```js
failureThreshold: 5
```

### 2. Increase rest timeout

```js
restTimeout: 5000
```

### 3. Enable jitter

```js
jitter: true
```

---

# 🧠 Mental Model

```
Request → Retry → Failure → Circuit Breaker updates state
                                ↓
                        OPEN (blocks traffic)
                                ↓
                      WAIT → HALF_OPEN
                                ↓
                         Recovery check
```

---

# 🚀 Goal of Playground

To give you **visibility into how resilience systems behave under failure**, not just theoretical correctness.

