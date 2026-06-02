import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoChat } from './VideoChat';

describe('VideoChat', () => {
  const defaultProps = {
    localStream: null,
    remoteStream: null,
    connectionState: 'new' as const,
    isAudioEnabled: true,
    isVideoEnabled: true,
    onToggleAudio: vi.fn(),
    onToggleVideo: vi.fn(),
    onEndCall: vi.fn(),
    localUserName: 'Alice',
    remoteUserName: 'Bob',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders two video elements for local and remote streams', () => {
    const localStream = new MediaStream();
    const remoteStream = new MediaStream();

    render(<VideoChat {...defaultProps} localStream={localStream} remoteStream={remoteStream} />);

    const videos = screen.getAllByTestId('video-element');
    expect(videos).toHaveLength(2);
  });

  it('assigns local stream to the local video element', () => {
    const localStream = new MediaStream();

    render(<VideoChat {...defaultProps} localStream={localStream} />);

    const localVideo = screen.getByTestId('local-video');
    expect(localVideo).toHaveAttribute('srcObject');
  });

  it('assigns remote stream to the remote video element', () => {
    const remoteStream = new MediaStream();

    render(<VideoChat {...defaultProps} remoteStream={remoteStream} />);

    const remoteVideo = screen.getByTestId('remote-video');
    expect(remoteVideo).toHaveAttribute('srcObject');
  });

  it('marks local video as muted to prevent audio feedback', () => {
    const localStream = new MediaStream();

    render(<VideoChat {...defaultProps} localStream={localStream} />);

    const localVideo = screen.getByTestId('local-video');
    expect(localVideo).toHaveAttribute('muted');
  });

  it('does not mute remote video', () => {
    const remoteStream = new MediaStream();

    render(<VideoChat {...defaultProps} remoteStream={remoteStream} />);

    const remoteVideo = screen.getByTestId('remote-video');
    expect(remoteVideo).not.toHaveAttribute('muted');
  });

  it('displays local user name label', () => {
    render(<VideoChat {...defaultProps} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('displays remote user name label', () => {
    render(<VideoChat {...defaultProps} />);

    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('displays "Waiting…" when remote stream is null', () => {
    render(<VideoChat {...defaultProps} remoteStream={null} />);

    expect(screen.getByText(/waiting/i)).toBeInTheDocument();
  });

  it('displays connection state indicator', () => {
    render(<VideoChat {...defaultProps} connectionState="connecting" />);

    expect(screen.getByTestId('connection-state')).toHaveTextContent(/connecting/i);
  });

  it('shows audio toggle button', () => {
    render(<VideoChat {...defaultProps} />);

    expect(screen.getByTestId('toggle-audio')).toBeInTheDocument();
  });

  it('shows video toggle button', () => {
    render(<VideoChat {...defaultProps} />);

    expect(screen.getByTestId('toggle-video')).toBeInTheDocument();
  });

  it('shows end call button', () => {
    render(<VideoChat {...defaultProps} />);

    expect(screen.getByTestId('end-call')).toBeInTheDocument();
  });

  it('calls onToggleAudio when audio button is clicked', () => {
    const onToggleAudio = vi.fn();
    render(<VideoChat {...defaultProps} onToggleAudio={onToggleAudio} />);

    fireEvent.click(screen.getByTestId('toggle-audio'));
    expect(onToggleAudio).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleVideo when video button is clicked', () => {
    const onToggleVideo = vi.fn();
    render(<VideoChat {...defaultProps} onToggleVideo={onToggleVideo} />);

    fireEvent.click(screen.getByTestId('toggle-video'));
    expect(onToggleVideo).toHaveBeenCalledTimes(1);
  });

  it('calls onEndCall when end call button is clicked', () => {
    const onEndCall = vi.fn();
    render(<VideoChat {...defaultProps} onEndCall={onEndCall} />);

    fireEvent.click(screen.getByTestId('end-call'));
    expect(onEndCall).toHaveBeenCalledTimes(1);
  });

  it('reflects audio disabled state visually', () => {
    render(<VideoChat {...defaultProps} isAudioEnabled={false} />);

    const btn = screen.getByTestId('toggle-audio');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('reflects video disabled state visually', () => {
    render(<VideoChat {...defaultProps} isVideoEnabled={false} />);

    const btn = screen.getByTestId('toggle-video');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('displays "Unknown" fallback when user names are not provided', () => {
    render(<VideoChat {...defaultProps} localUserName={undefined} remoteUserName={undefined} />);

    expect(screen.getAllByText('Unknown')).toHaveLength(2);
  });

  it('shows disconnected state visually when connection is lost', () => {
    render(<VideoChat {...defaultProps} connectionState="disconnected" />);

    expect(screen.getByTestId('connection-state')).toHaveClass('disconnected');
  });
});
