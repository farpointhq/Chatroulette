import React from 'react';
import type { MatchmakingQueueProps } from '../../types/lobby';

/**
 * Matchmaking Queue Component - Searching State
 * 
 * Displays:
 * - Animated spinner
 * - "Searching for opponent..." text
 * - Estimated wait time (if available)
 * - Cancel button
 */
export const MatchmakingQueue: React.FC<MatchmakingQueueProps> = ({
  estimatedWaitTime,
  onCancel,
}) => {
  return (
    <div className="matchmaking-queue" data-testid="matchmaking-queue">
      <div className="spinner" data-testid="spinner" aria-label="Loading">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      
      <p className="searching-text" data-testid="searching-text">
        Searching for opponent...
      </p>

      {estimatedWaitTime !== null && (
        <p className="wait-time" data-testid="wait-time">
          ~{estimatedWaitTime} {estimatedWaitTime === 1 ? 'second' : 'seconds'}
        </p>
      )}

      <button
        className="cancel-button"
        onClick={onCancel}
        data-testid="cancel-button"
      >
        Cancel
      </button>
    </div>
  );
};
