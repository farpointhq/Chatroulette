import React from 'react';
import type { OpponentFoundProps } from '../../types/lobby';

/**
 * Opponent Found Component - Match Found State
 * 
 * Displays:
 * - Opponent nickname and rating
 * - Assigned color indicator (White/Black)
 * - Countdown timer
 * - Accept and Decline buttons
 */
export const OpponentFound: React.FC<OpponentFoundProps> = ({
  opponent,
  color,
  countdownSeconds,
  onAccept,
  onDecline,
}) => {
  const colorClass = color === 'white' ? 'color-white' : 'color-black';
  const colorLabel = color === 'white' ? 'White' : 'Black';

  return (
    <div className="opponent-found" data-testid="opponent-found">
      <h2 className="match-title">Match Found!</h2>
      
      <div className="opponent-info" data-testid="opponent-info">
        <div className="opponent-details">
          <p className="opponent-nickname" data-testid="opponent-nickname">
            {opponent.nickname}
          </p>
          {opponent.rating !== undefined && (
            <p className="opponent-rating" data-testid="opponent-rating">
              Rating: {opponent.rating}
            </p>
          )}
        </div>
        
        <div className={`color-indicator ${colorClass}`} data-testid="color-indicator">
          <span className="color-label">Your color: {colorLabel}</span>
        </div>
      </div>

      <div className="countdown-container" data-testid="countdown">
        <p className="countdown-label">Game starts in:</p>
        <p className="countdown-timer" data-testid="countdown-timer">
          {countdownSeconds}
        </p>
      </div>

      <div className="action-buttons">
        <button
          className="accept-button"
          onClick={onAccept}
          data-testid="accept-button"
        >
          Accept
        </button>
        <button
          className="decline-button"
          onClick={onDecline}
          data-testid="decline-button"
        >
          Decline
        </button>
      </div>
    </div>
  );
};
