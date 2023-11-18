import { FC } from 'react';
import { Game } from './components/Game';

import './style.css';

export const App: FC<{ name: string }> = ({ name }) => {
  return (
    <div className="App h-screen px-4 pt-4">
      <Game />
    </div>
  );
};
