import type { ConnectionErrorProps } from '../../types/lobby';

export function ConnectionError({ message, onRetry }: ConnectionErrorProps) {
  throw new Error('ConnectionError: Not implemented');
}
