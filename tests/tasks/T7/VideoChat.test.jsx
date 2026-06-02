import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VideoChat, { CONNECTION_STATES } from '../../../src/components/VideoChat.jsx';

// ---------------------------------------------------------------------------
// Helper: create a fake MediaStream with two tracks (video + audio)
// ---------------------------------------------------------------------------
function createFakeStream() {
  const videoTrack = { kind: 'video', label: 'fake-video', enabled: true };
  const audioTrack = { kind: 'audio', label: 'fake-audio', enabled: true };
  return {
    getTracks: () => [videoTrack, audioTrack],
    getVideoTracks: () => [videoTrack],
    getAudioTracks: () => [audioTrack],
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('VideoChat component', () => {
  // --- Rendering & layout --------------------------------------------------
  it('renders the video-chat container', () => {
    render(<VideoChat />);
    expect(screen.getByTestId('video-chat')).toBeInTheDocument();
  });

  it('renders local and remote video feed containers side-by-side', () => {
    render(<VideoChat />);
    expect(screen.getByTestId('video-local')).toBeInTheDocument();
    expect(screen.getByTestId('video-remote')).toBeInTheDocument();
  });

  // --- Local webcam stream -------------------------------------------------
  it('renders a local <video> element with autoPlay and muted', () => {
    const localStream = createFakeStream();
    render(<VideoChat localStream={localStream} />);
    const video = screen.getByTestId('local-video');
    expect(video.tagName).toBe('VIDEO');
    expect(video).toHaveAttribute('autoPlay');
    expect(video).toHaveAttribute('muted');
  });

  it('assigns the local stream to the local <video> element', () => {
    const localStream = createFakeStream();
    render(<VideoChat localStream={localStream} />);
    const video = screen.getByTestId('local-video');
    expect(video.srcObject).toBe(localStream);
  });

  it('shows a "You" label on the local feed', () => {
    render(<VideoChat />);
    expect(screen.getByText(/you/i)).toBeInTheDocument();
  });

  // --- Remote peer stream --------------------------------------------------
  it('renders a remote <video> element with autoPlay (not muted)', () => {
    const remoteStream = createFakeStream();
    render(<VideoChat remoteStream={remoteStream} />);
    const video = screen.getByTestId('remote-video');
    expect(video.tagName).toBe('VIDEO');
    expect(video).toHaveAttribute('autoPlay');
    expect(video).not.toHaveAttribute('muted');
  });

  it('assigns the remote stream to the remote <video> element', () => {
    const remoteStream = createFakeStream();
    render(<VideoChat remoteStream={remoteStream} />);
    const video = screen.getByTestId('remote-video');
    expect(video.srcObject).toBe(remoteStream);
  });

  it('shows an "Opponent" label on the remote feed', () => {
    render(<VideoChat />);
    expect(screen.getByText(/opponent/i)).toBeInTheDocument();
  });

  // --- Placeholder when opponent camera is off -----------------------------
  it('shows a placeholder when remoteStream is null', () => {
    render(<VideoChat remoteStream={null} />);
    expect(screen.getByTestId('remote-placeholder')).toBeInTheDocument();
    expect(screen.getByText(/camera off/i)).toBeInTheDocument();
  });

  it('does NOT show placeholder when remoteStream is provided', () => {
    const remoteStream = createFakeStream();
    render(<VideoChat remoteStream={remoteStream} />);
    expect(screen.queryByTestId('remote-placeholder')).not.toBeInTheDocument();
  });

  it('shows a placeholder when localStream is null', () => {
    render(<VideoChat localStream={null} />);
    expect(screen.getByTestId('local-placeholder')).toBeInTheDocument();
  });

  // --- Audio mute / unmute toggle ------------------------------------------
  it('renders an audio mute/unmute button', () => {
    render(<VideoChat />);
    expect(screen.getByTestId('toggle-audio')).toBeInTheDocument();
  });

  it('calls onToggleAudio when the audio button is clicked', () => {
    const onToggleAudio = vi.fn();
    render(<VideoChat onToggleAudio={onToggleAudio} />);
    fireEvent.click(screen.getByTestId('toggle-audio'));
    expect(onToggleAudio).toHaveBeenCalledTimes(1);
  });

  // --- Video enable / disable toggle ---------------------------------------
  it('renders a video enable/disable button', () => {
    render(<VideoChat />);
    expect(screen.getByTestId('toggle-video')).toBeInTheDocument();
  });

  it('calls onToggleVideo when the video button is clicked', () => {
    const onToggleVideo = vi.fn();
    render(<VideoChat onToggleVideo={onToggleVideo} />);
    fireEvent.click(screen.getByTestId('toggle-video'));
    expect(onToggleVideo).toHaveBeenCalledTimes(1);
  });

  // --- Connection state indicators -----------------------------------------
  it('shows "Connecting…" indicator when state is CONNECTING', () => {
    render(<VideoChat connectionState={CONNECTION_STATES.CONNECTING} />);
    expect(screen.getByText(/connecting/i)).toBeInTheDocument();
    expect(screen.getByTestId('connection-indicator')).toHaveClass('connecting');
  });

  it('shows "Connected" indicator when state is CONNECTED', () => {
    render(<VideoChat connectionState={CONNECTION_STATES.CONNECTED} />);
    expect(screen.getByText(/connected/i)).toBeInTheDocument();
    expect(screen.getByTestId('connection-indicator')).toHaveClass('connected');
  });

  it('shows "Disconnected" indicator when state is DISCONNECTED', () => {
    render(<VideoChat connectionState={CONNECTION_STATES.DISCONNECTED} />);
    expect(screen.getByText(/disconnected/i)).toBeInTheDocument();
    expect(screen.getByTestId('connection-indicator')).toHaveClass('disconnected');
  });

  it('shows "Reconnecting…" indicator when state is RECONNECTING', () => {
    render(<VideoChat connectionState={CONNECTION_STATES.RECONNECTING} />);
    expect(screen.getByText(/reconnecting/i)).toBeInTheDocument();
    expect(screen.getByTestId('connection-indicator')).toHaveClass('reconnecting');
  });

  // --- Default connection state --------------------------------------------
  it('defaults to CONNECTING state', () => {
    render(<VideoChat />);
    expect(screen.getByText(/connecting/i)).toBeInTheDocument();
  });

  // --- Both streams present ------------------------------------------------
  it('renders both video elements when both streams are provided', () => {
    const local = createFakeStream();
    const remote = createFakeStream();
    render(<VideoChat localStream={local} remoteStream={remote} />);
    expect(screen.getByTestId('local-video').srcObject).toBe(local);
    expect(screen.getByTestId('remote-video').srcObject).toBe(remote);
    expect(screen.queryByTestId('local-placeholder')).not.toBeInTheDocument();
    expect(screen.queryByTestId('remote-placeholder')).not.toBeInTheDocument();
  });
});
