import React from 'react';
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
 */
export const Lobby: React.FC<LobbyProps> = (props) => {
  // STUB: Not yet implemented. Tests should fail against this.
  return (
    <div data-testid="lobby-container">
      <h1>Lobby</h1>
      <p data-testid="lobby-status">{props.status}</p>
    </div>
  );
};
