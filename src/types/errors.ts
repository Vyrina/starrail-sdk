export class HSRSDKError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HSRSDKError';
  }
}

export class HSRInvalidUIDError extends HSRSDKError {
  constructor(uid: string) {
    super(`Invalid HSR UID: "${uid}". Must be 9 digits.`);
    this.name = 'HSRInvalidUIDError';
  }
}

export class HSRRateLimitError extends HSRSDKError {
  constructor(provider: string) {
    super(`Rate limit reached for ${provider}.`);
    this.name = 'HSRRateLimitError';
  }
}

export class HSRDataNotFoundError extends HSRSDKError {
  constructor(resource: string) {
    super(`Resource not found: ${resource}`);
    this.name = 'HSRDataNotFoundError';
  }
}

export class HSRTimeoutError extends HSRSDKError {
  constructor(url: string, timeoutMs: number) {
    super(`Request to ${url} timed out after ${timeoutMs}ms.`);
    this.name = 'HSRTimeoutError';
  }
}
