import React from 'react';
import { LandingPage } from './LandingPage';
import { MatchmakingQueue } from './MatchmakingQueue';
import { OpponentFound } from './OpponentFound';
import { ConnectionError } from './ConnectionError';
import type { LobbyProps } from './types';

/**
 * Lobby & Matchmaking UI Component
 *
 * Provides the entry point for players to:
 * - Enter a nickname
 * - See how many players are online
 * - Start matchmaking (find a random opponent)
 * - Cancel while searching
 * - Accept/decline when a match is found
 * - View game state transitions
 *
 * State machine: idle → searching → match-found → in-game
 *                              ↓
 *                          error (can return to any state)
 */
export const Lobby: React.FC<LobbyProps> = (props) => {
  const {
    status,
    nickname,
    onlinePlayers,
    estimatedWaitTime,
    matchFound,
    errorMessage,
    onNicknameChange,
    onFindMatch,
    onCancelSearch,
    onAcceptMatch,
    onDeclineMatch,
  } = props;

  // Render error overlay if in error state (but keep underlying UI visible)
  const showErrorOverlay = status === 'error';

  // Render the appropriate view based on status
  const renderContent = () => {
    switch (status) {
      case 'idle':
        return (
          <LandingPage
            nickname={nickname}
            onlinePlayers={onlinePlayers}
            onNicknameChange={onNicknameChange}
            onFindMatch={onFindMatch}
          />
        );

      case 'searching':
        return (
          <MatchmakingQueue
            estimatedWaitTime={estimatedWaitTime}
            onCancel={onCancelSearch}
          />
        );

      case 'match-found':
        if (!matchFound) {
          // Invalid state - match-found requires matchFound data
          return (
            <div className="error-state" data-testid="invalid-state">
              <p>Invalid state: match data missing</p>
            </div>
          );
        }
        return (
          <OpponentFound
            opponent={matchFound.opponent}
            color={matchFound.color}
            countdownSeconds={matchFound.countdownSeconds}
            onAccept={onAcceptMatch}
            onDecline={onDeclineMatch}
          />
        );

      case 'in-game':
        return (
          <div className="in-game-state" data-testid="in-game">
            <h2>Game in Progress</h2>
            <p data-testid="game-progress-message">
              Your game is currently in progress.
            </p>
            <button
              className="return-to-lobby-button"
              data-testid="return-to-lobby-button"
              onClick={onCancelSearch}
            >
              Return to Lobby
            </button>
          </div>
        );

      case 'error':
        // In error state, show the idle UI underneath with error overlay
        return (
          <LandingPage
            nickname={nickname}
            onlinePlayers={onlinePlayers}
            onNicknameChange={onNicknameChange}
            onFindMatch={onFindMatch}
          />
        );

      default:
        // Fallback to idle state
        return (
          <LandingPage
            nickname={nickname}
            onlinePlayers={onlinePlayers}
            onNicknameChange={onNicknameChange}
            onFindMatch={onFindMatch}
          />
        );
    }
  };

  return (
    <div className="lobby-container" data-testid="lobby-container">
      {renderContent()}
      
      {showErrorOverlay && (
        <ConnectionError
          errorMessage={errorMessage || 'An unexpected error occurred'}
          onRetry={onFindMatch}
        />
      )}
    </div>
  );
};
