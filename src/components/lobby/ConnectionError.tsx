import React from 'react';
import type { ConnectionErrorProps } from './types';

/**
 * Connection Error Component - Error State Overlay
 * 
 * Displays:
 * - Error message prominently
 * - Retry button
 * - Keeps the idle UI visible behind (handled by parent Lobby component)
 */
export const ConnectionError: React.FC<ConnectionErrorProps> = ({
  errorMessage,
  onRetry,
}) => {
  return (
    <div className="connection-error-overlay" data-testid="connection-error" role="alert">
      <div className="error-content">
        <div className="error-icon" aria-hidden="true">⚠️</div>
        <h3 className="error-title">Connection Error</h3>
        <p className="error-message" data-testid="error-message">
          {errorMessage}
        </p>
        <button
          className="retry-button"
          onClick={onRetry}
          data-testid="retry-button"
        >
          Retry
        </button>
      </div>
    </div>
  );
};
