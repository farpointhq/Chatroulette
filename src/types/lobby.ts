export type LobbyState = 'idle' | 'searching' | 'found' | 'error';

export interface OpponentInfo {
  name: string;
  avatar?: string;
  color: 'white' | 'black';
}

export interface LobbyProps {
  state: LobbyState;
  playerCount: number;
  opponent?: OpponentInfo;
  errorMessage?: string;
  onPlay: () => void;
  onCancelSearch: () => void;
  onRetry: () => void;
  onReady?: () => void;
}

export interface LandingPageProps {
  playerCount: number;
  onPlay: () => void;
}

export interface MatchmakingQueueProps {
  onCancel: () => void;
}

export interface OpponentFoundProps {
  opponent: OpponentInfo;
  onReady: () => void;
}

export interface ConnectionErrorProps {
  message: string;
  onRetry: () => void;
}
