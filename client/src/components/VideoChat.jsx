import React, { useRef, useState, useEffect, useCallback } from 'react';
import './VideoChat.css';

export const CONNECTION_STATES = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  RECONNECTING: 'reconnecting',
};

/**
 * VideoChat component — displays local and remote webcam streams with controls.
 *
 * Props:
 *   - localStream: MediaStream | null  (from getUserMedia)
 *   - remoteStream: MediaStream | null (from WebRTC peer)
 *   - connectionState: string          (one of CONNECTION_STATES)
 *   - onToggleAudio: () => void       (optional callback)
 *   - onToggleVideo: () => void       (optional callback)
 */
export default function VideoChat({
  localStream = null,
  remoteStream = null,
  connectionState = CONNECTION_STATES.CONNECTING,
  onToggleAudio,
  onToggleVideo,
}) {
  // TODO: Implement video chat UI
  // - Render <video> elements for local and remote streams
  // - Audio mute / video enable toggles
  // - Connection state indicators
  // - Placeholder when opponent camera is off
  return (
    <div className="video-chat" data-testid="video-chat">
      <div>VideoChat — not yet implemented</div>
    </div>
  );
}
