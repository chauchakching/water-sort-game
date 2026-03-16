import { FC } from 'react';
import { Game } from './components/Game';

import './style.css';

export const App: FC<{ name: string }> = ({ name }) => {
  return (
    <div className="h-screen">
      <Game />
    </div>
  );
};
