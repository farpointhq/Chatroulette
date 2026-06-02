import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Lobby } from '../../../src/components/Lobby';
import type { LobbyProps } from '../../../src/components/Lobby';

const defaultProps: LobbyProps = {
  status: 'idle',
  nickname: '',
  onlinePlayers: 42,
  estimatedWaitTime: null,
  matchFound: null,
  errorMessage: null,
  onNicknameChange: vi.fn(),
  onFindMatch: vi.fn(),
  onCancelSearch: vi.fn(),
  onAcceptMatch: vi.fn(),
  onDeclineMatch: vi.fn(),
};

// ─────────────────────────────────────────────
// IDLE STATE
// ─────────────────────────────────────────────

describe('Lobby — idle state', () => {
  it('renders the lobby title/branding', () => {
    render(<Lobby {...defaultProps} />);
    expect(screen.getByText(/chess roulette/i)).toBeInTheDocument();
  });

  it('renders nickname input field with correct value', () => {
    render(<Lobby {...defaultProps} nickname="Alice" />);
    expect(screen.getByRole('textbox')).toHaveValue('Alice');
  });

  it('calls onNicknameChange when typing in nickname input', () => {
    const onNicknameChange = vi.fn();
    render(<Lobby {...defaultProps} onNicknameChange={onNicknameChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Bob' } });
    expect(onNicknameChange).toHaveBeenCalledTimes(1);
    expect(onNicknameChange).toHaveBeenCalledWith('Bob');
  });

  it('renders "Find Match" button when idle', () => {
    render(<Lobby {...defaultProps} />);
    expect(screen.getByRole('button', { name: /find match/i })).toBeInTheDocument();
  });

  it('calls onFindMatch when "Find Match" button is clicked', () => {
    const onFindMatch = vi.fn();
    render(<Lobby {...defaultProps} onFindMatch={onFindMatch} />);
    fireEvent.click(screen.getByRole('button', { name: /find match/i }));
    expect(onFindMatch).toHaveBeenCalledTimes(1);
  });

  it('disables "Find Match" button when nickname is empty', () => {
    render(<Lobby {...defaultProps} nickname="" />);
    expect(screen.getByRole('button', { name: /find match/i })).toBeDisabled();
  });

  it('enables "Find Match" button when nickname has at least 1 character', () => {
    render(<Lobby {...defaultProps} nickname="X" />);
    expect(screen.getByRole('button', { name: /find match/i })).toBeEnabled();
  });

  it('displays the number of online players', () => {
    render(<Lobby {...defaultProps} onlinePlayers={1337} />);
    expect(screen.getByText(/1337/)).toBeInTheDocument();
  });

  it('displays a friendly message about online players', () => {
    render(<Lobby {...defaultProps} onlinePlayers={42} />);
    expect(screen.getByText(/42 players online/i)).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// SEARCHING STATE
// ─────────────────────────────────────────────

describe('Lobby — searching state', () => {
  it('renders a searching/spinner indicator', () => {
    render(<Lobby {...defaultProps} status="searching" />);
    expect(screen.getByText(/searching/i)).toBeInTheDocument();
  });

  it('renders "Cancel" button while searching', () => {
    render(<Lobby {...defaultProps} status="searching" />);
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('calls onCancelSearch when "Cancel" button is clicked', () => {
    const onCancelSearch = vi.fn();
    render(<Lobby {...defaultProps} status="searching" onCancelSearch={onCancelSearch} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancelSearch).toHaveBeenCalledTimes(1);
  });

  it('hides "Find Match" button while searching', () => {
    render(<Lobby {...defaultProps} status="searching" />);
    expect(screen.queryByRole('button', { name: /find match/i })).not.toBeInTheDocument();
  });

  it('displays estimated wait time when available', () => {
    render(<Lobby {...defaultProps} status="searching" estimatedWaitTime={45} />);
    expect(screen.getByText(/~45 seconds?/i)).toBeInTheDocument();
  });

  it('hides estimated wait time when null', () => {
    render(<Lobby {...defaultProps} status="searching" estimatedWaitTime={null} />);
    expect(screen.queryByText(/wait/)).not.toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// MATCH-FOUND STATE
// ─────────────────────────────────────────────

describe('Lobby — match-found state', () => {
  const matchProps: LobbyProps = {
    ...defaultProps,
    status: 'match-found',
    matchFound: {
      opponent: { id: 'opp-1', nickname: 'Magnus', rating: 2850 },
      color: 'white',
      countdownSeconds: 10,
    },
  };

  it('renders opponent nickname', () => {
    render(<Lobby {...matchProps} />);
    expect(screen.getByText(/Magnus/)).toBeInTheDocument();
  });

  it('renders opponent rating when provided', () => {
    render(<Lobby {...matchProps} />);
    expect(screen.getByText(/2850/)).toBeInTheDocument();
  });

  it('renders assigned color for local player', () => {
    render(<Lobby {...matchProps} />);
    expect(screen.getByText(/white/i)).toBeInTheDocument();
  });

  it('renders a countdown timer', () => {
    render(<Lobby {...matchProps} />);
    expect(screen.getByText(/10/)).toBeInTheDocument();
  });

  it('renders "Accept" button', () => {
    render(<Lobby {...matchProps} />);
    expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument();
  });

  it('renders "Decline" button', () => {
    render(<Lobby {...matchProps} />);
    expect(screen.getByRole('button', { name: /decline/i })).toBeInTheDocument();
  });

  it('calls onAcceptMatch when "Accept" button is clicked', () => {
    const onAcceptMatch = vi.fn();
    render(<Lobby {...matchProps} onAcceptMatch={onAcceptMatch} />);
    fireEvent.click(screen.getByRole('button', { name: /accept/i }));
    expect(onAcceptMatch).toHaveBeenCalledTimes(1);
  });

  it('calls onDeclineMatch when "Decline" button is clicked', () => {
    const onDeclineMatch = vi.fn();
    render(<Lobby {...matchProps} onDeclineMatch={onDeclineMatch} />);
    fireEvent.click(screen.getByRole('button', { name: /decline/i }));
    expect(onDeclineMatch).toHaveBeenCalledTimes(1);
  });

  it('hides nickname input and online count during match-found', () => {
    render(<Lobby {...matchProps} />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByText(/players online/i)).not.toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// IN-GAME STATE
// ─────────────────────────────────────────────

describe('Lobby — in-game state', () => {
  it('renders a "game in progress" message', () => {
    render(<Lobby {...defaultProps} status="in-game" />);
    expect(screen.getByText(/game in progress/i)).toBeInTheDocument();
  });

  it('renders a "Return to Lobby" or "End Game" button', () => {
    render(<Lobby {...defaultProps} status="in-game" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// ERROR STATE
// ─────────────────────────────────────────────

describe('Lobby — error state', () => {
  it('renders error message when provided', () => {
    render(<Lobby {...defaultProps} status="error" errorMessage="Connection lost" />);
    expect(screen.getByText(/Connection lost/)).toBeInTheDocument();
  });

  it('renders a retry/dismiss button when in error state', () => {
    render(<Lobby {...defaultProps} status="error" errorMessage="Server busy" />);
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('allows returning to idle from error state', () => {
    render(<Lobby {...defaultProps} status="error" errorMessage="Oops" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /find match/i })).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// ACCESSIBILITY & STRUCTURE
// ─────────────────────────────────────────────

describe('Lobby — accessibility & structure', () => {
  it('has a single main landmark when idle', () => {
    render(<Lobby {...defaultProps} />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('nickname input has an associated label', () => {
    render(<Lobby {...defaultProps} />);
    expect(screen.getByLabelText(/nickname/i)).toBeInTheDocument();
  });
});
