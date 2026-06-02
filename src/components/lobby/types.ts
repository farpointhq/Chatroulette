// ============================================
// Lobby & Matchmaking — Type Definitions
// ============================================

export type LobbyStatus = 'idle' | 'searching' | 'match-found' | 'in-game' | 'error';

export interface PlayerInfo {
  id: string;
  nickname: string;
  rating?: number;
}

export interface MatchFoundData {
  opponent: PlayerInfo;
  color: 'white' | 'black';
  countdownSeconds: number;
}

export interface LobbyProps {
  /** Current status of the lobby */
  status: LobbyStatus;
  /** The local player's nickname (controlled input) */
  nickname: string;
  /** Number of players currently online */
  onlinePlayers: number;
  /** Estimated wait time in seconds (null if not available) */
  estimatedWaitTime: number | null;
  /** Match data when status is 'match-found' */
  matchFound: MatchFoundData | null;
  /** Error message to display */
  errorMessage: string | null;
  /** Callback when nickname input changes */
  onNicknameChange: (nickname: string) => void;
  /** Callback when user clicks "Find Match" */
  onFindMatch: () => void;
  /** Callback when user cancels search */
  onCancelSearch: () => void;
  /** Callback when user accepts a match */
  onAcceptMatch: () => void;
  /** Callback when user declines a match */
  onDeclineMatch: () => void;
}
