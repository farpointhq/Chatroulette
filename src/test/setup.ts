import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock MediaStream
global.MediaStream = vi.fn().mockImplementation((tracks = []) => ({
  getTracks: vi.fn().mockReturnValue(tracks),
  getAudioTracks: vi.fn().mockReturnValue([]),
  getVideoTracks: vi.fn().mockReturnValue([]),
  addTrack: vi.fn(),
  removeTrack: vi.fn(),
  clone: vi.fn().mockReturnValue(new MediaStream()),
})) as unknown as typeof MediaStream;

// Mock navigator.mediaDevices for WebRTC tests
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue(new MediaStream()),
    enumerateDevices: vi.fn().mockResolvedValue([]),
  },
  writable: true,
});

// Mock RTCPeerConnection
global.RTCPeerConnection = vi.fn().mockImplementation(() => ({
  createOffer: vi.fn().mockResolvedValue({ type: 'offer', sdp: '' }),
  createAnswer: vi.fn().mockResolvedValue({ type: 'answer', sdp: '' }),
  setLocalDescription: vi.fn().mockResolvedValue(undefined),
  setRemoteDescription: vi.fn().mockResolvedValue(undefined),
  addIceCandidate: vi.fn().mockResolvedValue(undefined),
  close: vi.fn(),
  addTrack: vi.fn(),
  ontrack: null,
  onicecandidate: null,
  onconnectionstatechange: null,
  connectionState: 'new',
  getSenders: vi.fn().mockReturnValue([]),
}));

// Mock HTMLVideoElement methods
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  writable: true,
  value: vi.fn().mockResolvedValue(undefined),
});

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  writable: true,
  value: vi.fn(),
});