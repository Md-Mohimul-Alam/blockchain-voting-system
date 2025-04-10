

import React, { useEffect, useRef } from 'react';
import { Player } from '@lordicon/react';
import ICON from './com3.json'; // Use import instead of require

export default function PlayThird() {
  const playerRef = useRef(null); // Simplified ref initialization

  useEffect(() => {
    // Play the animation from the beginning when component mounts
    playerRef.current?.playFromBeginning();
  }, []);

  return (
    <Player 
      ref={playerRef} 
      icon={ICON} 
    />
  );
}
