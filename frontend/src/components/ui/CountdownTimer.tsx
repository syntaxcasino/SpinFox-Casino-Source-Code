import React, { useEffect, useState } from 'react';
import { useCountdown } from '@/lib/utils/common';

function CountdownTimer({
  initialSeconds,
  showPadding = true,
  showHours = true,
  showSeconds = true,
  textColor = 'text-white',
  variant = 'default'
}: {
  initialSeconds: number;
  showPadding?: boolean;
  showHours?: boolean;
  showSeconds?: boolean;
  textColor?: string;
  variant?: 'default' | 'starts';
}) {
  const countdown = useCountdown(initialSeconds, showHours, showSeconds);

  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  useEffect(() => {
    if (variant !== 'starts') return;
    setSecondsLeft(initialSeconds);
  }, [initialSeconds, variant]);

  useEffect(() => {
    if (variant !== 'starts') return;
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, variant]);

  const renderContent = () => {
    if (variant === 'starts') {
      if (secondsLeft <= 0) return 'Starts in 00:00:00';
      const days = Math.floor(secondsLeft / 86400);
      if (days >= 1) {
        return `Starts in ${days} ${days === 1 ? 'day' : 'days'}`;
      }
      const hours = Math.floor((secondsLeft % 86400) / 3600);
      const minutes = Math.floor((secondsLeft % 3600) / 60);
      const secs = secondsLeft % 60;
      const hh = hours.toString().padStart(2, '0');
      const mm = minutes.toString().padStart(2, '0');
      const ss = secs.toString().padStart(2, '0');
      return `Starts in ${hh}:${mm}:${ss}`;
    }
    return countdown;
  };

  return (
    <p
      className={`text-xs ${textColor} ${
        showPadding ? 'bg-light-border dark:bg-dark-border rounded-[6px] py-0.5 px-2' : ''
      }`}
    >
      {renderContent()}
    </p>
  );
}

export default CountdownTimer;
