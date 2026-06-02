import { Lobby } from './components/lobby/Lobby';

function App() {
  return (
    <div className="app">
      <Lobby
        state="idle"
        playerCount={0}
        onPlay={() => {}}
        onCancelSearch={() => {}}
        onRetry={() => {}}
      />
    </div>
  );
}

export default App;
