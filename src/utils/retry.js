const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retries an async operation with linear backoff. Generic on purpose (no
// HTTP-specific knowledge) so it stays reusable beyond the AI service client
// if another outbound integration needs the same resilience later.
const withRetry = async (
  fn,
  { retries = 2, delayMs = 300, shouldRetry = () => true, onRetry } = {}
) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      const isLastAttempt = attempt === retries;
      if (isLastAttempt || !shouldRetry(error)) break;

      if (onRetry) onRetry(error, attempt + 1);
      await sleep(delayMs * (attempt + 1));
    }
  }

  throw lastError;
};

module.exports = { withRetry };
