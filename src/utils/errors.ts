export const AUTH_REQUIRED_CODE = 'AUTH_REQUIRED' as const;

export const AUTH_REQUIRED_RECOVERY = [
  'export FIRECRAWL_API_KEY="fc-YOUR-KEY"',
  'firecrawl login --api-key "$FIRECRAWL_API_KEY"',
  'firecrawl login',
] as const;

export class AuthRequiredError extends Error {
  readonly code = AUTH_REQUIRED_CODE;
  readonly retryable = false;
  readonly recovery = AUTH_REQUIRED_RECOVERY;

  constructor() {
    super('Firecrawl requires authentication for this request.');
    this.name = 'AuthRequiredError';
  }
}

export function isAuthRequiredError(
  error: unknown
): error is AuthRequiredError {
  return (
    error instanceof AuthRequiredError ||
    (!!error &&
      typeof error === 'object' &&
      (error as { code?: unknown }).code === AUTH_REQUIRED_CODE)
  );
}

export function formatAuthRequiredError(): string {
  return [
    `[${AUTH_REQUIRED_CODE}] Firecrawl requires authentication for this request.`,
    'Set an API key, then retry:',
    `  ${AUTH_REQUIRED_RECOVERY[0]}`,
    `  ${AUTH_REQUIRED_RECOVERY[1]}`,
    'Or sign in interactively:',
    `  ${AUTH_REQUIRED_RECOVERY[2]}`,
    'Do not retry until authentication is configured.',
  ].join('\n');
}
