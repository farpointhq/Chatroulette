import React from 'react';
import type { LandingPageProps } from './types';

/**
 * Landing Page Component - Idle State
 * 
 * Displays:
 * - Chess Roulette branding
 * - Nickname input field with label
 * - Online player count
 * - Find Match button (disabled when nickname is empty)
 */
export const LandingPage: React.FC<LandingPageProps> = ({
  nickname,
  onlinePlayers,
  onNicknameChange,
  onFindMatch,
}) => {
  const isDisabled = nickname.trim().length === 0;

  return (
    <main className="lobby-main" data-testid="landing-page">
      <div className="lobby-card">
        <h1 className="lobby-title">Chess Roulette</h1>
        
        <div className="nickname-input-group">
          <label htmlFor="nickname-input" className="nickname-label">
            Enter your nickname
          </label>
          <input
            id="nickname-input"
            type="text"
            className="nickname-input"
            value={nickname}
            onChange={(e) => onNicknameChange(e.target.value)}
            placeholder="Your nickname"
            data-testid="nickname-input"
            maxLength={20}
          />
        </div>

        <p className="online-players" data-testid="online-players">
          {onlinePlayers} {onlinePlayers === 1 ? 'player' : 'players'} online
        </p>

        <button
          className="find-match-button"
          onClick={onFindMatch}
          disabled={isDisabled}
          data-testid="find-match-button"
        >
          Find Match
        </button>
      </div>
    </main>
  );
};
