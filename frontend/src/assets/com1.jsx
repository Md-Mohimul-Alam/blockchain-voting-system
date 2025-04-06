import React, { useEffect, useRef } from 'react';
import { Player } from '@lordicon/react';
import ICON from './user.json'; // Use import instead of require

export default function PlayOnce() {
  const playerRef = useRef(null); // Simplified ref initialization

  useEffect(() => {
    // Ensuring the animation plays from the beginning when the component mounts
    playerRef.current?.playFromBeginning();
  }, []);

  return (
    <Player 
      ref={playerRef} 
      icon={ICON} 
    />
  );
}