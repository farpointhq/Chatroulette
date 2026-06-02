import { useState, useCallback } from 'react';
import { Lobby } from './components/lobby/Lobby';
import type { LobbyStatus, MatchFoundData } from './components/lobby/types';

function App() {
  // Lobby state management
  const [status, setStatus] = useState<LobbyStatus>('idle');
  const [nickname, setNickname] = useState<string>('');
  const [onlinePlayers, setOnlinePlayers] = useState<number>(42);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<number | null>(null);
  const [matchFound, setMatchFound] = useState<MatchFoundData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mock socket.io integration with setTimeout for demo purposes
  const handleFindMatch = useCallback(() => {
    if (nickname.trim().length === 0) return;

    setStatus('searching');
    setEstimatedWaitTime(45); // Mock wait time

    // Simulate matchmaking process
    setTimeout(() => {
      // Simulate finding a match
      const mockMatch: MatchFoundData = {
        opponent: {
          id: 'opp-1',
          nickname: 'Magnus',
          rating: 2850,
        },
        color: Math.random() > 0.5 ? 'white' : 'black',
        countdownSeconds: 10,
      };

      setMatchFound(mockMatch);
      setStatus('match-found');
      setEstimatedWaitTime(null);
    }, 3000);
  }, [nickname]);

  const handleCancelSearch = useCallback(() => {
    setStatus('idle');
    setMatchFound(null);
    setEstimatedWaitTime(null);
    setErrorMessage(null);
  }, []);

  const handleAcceptMatch = useCallback(() => {
    setStatus('in-game');
    setMatchFound(null);
    // In a real app, this would transition to the game screen
    console.log('Match accepted! Starting game...');
  }, []);

  const handleDeclineMatch = useCallback(() => {
    setStatus('idle');
    setMatchFound(null);
    // In a real app, this would search for a new opponent
    console.log('Match declined. Searching for new opponent...');
  }, []);

  const handleRetry = useCallback(() => {
    setErrorMessage(null);
    setStatus('idle');
    // Could automatically retry or let user click Find Match again
  }, []);

  const handleNicknameChange = useCallback((newNickname: string) => {
    setNickname(newNickname);
  }, []);

  return (
    <div className="app">
      <Lobby
        status={status}
        nickname={nickname}
        onlinePlayers={onlinePlayers}
        estimatedWaitTime={estimatedWaitTime}
        matchFound={matchFound}
        errorMessage={errorMessage}
        onNicknameChange={handleNicknameChange}
        onFindMatch={handleFindMatch}
        onCancelSearch={handleCancelSearch}
        onAcceptMatch={handleAcceptMatch}
        onDeclineMatch={handleDeclineMatch}
      />
    </div>
  );
}

export default App;
