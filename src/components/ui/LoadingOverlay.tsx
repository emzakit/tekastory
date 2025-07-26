import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { loadingMessages } from '../../config/loading-messages';

const LoadingOverlay: React.FC = () => {
  const [currentMessage, setCurrentMessage] = useState(
    loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentMessage(prevMessage => {
        let newMessage;
        // Ensure the next message is different from the current one, if possible
        do {
          newMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
        } while (loadingMessages.length > 1 && newMessage === prevMessage);
        return newMessage;
      });
    }, 2500); // Change message every 2.5 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-[rgba(var(--rgb-text),var(--opacity-loading-overlay))] backdrop-blur-sm flex flex-col items-center justify-center z-50 text-[var(--color-text-light)] transition-opacity duration-300"
    >
      <Icon name="LoaderCircle" className="w-16 h-16 animate-spin mb-6" />
      <p className="text-2xl font-semibold mb-2">Please wait...</p>
      <p className="text-lg text-[var(--color-text-subtle)]">{currentMessage}</p>
    </div>
  );
};

export default LoadingOverlay;