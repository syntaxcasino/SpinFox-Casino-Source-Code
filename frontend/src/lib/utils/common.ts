import { useEffect, useState } from "react";

export function useCountdown(initialSeconds: number, showHours: boolean, showSeconds: boolean) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return showHours
      ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs
          .toString()
          .padStart(2, '0')}`
      : showSeconds
      ? `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${minutes.toString().padStart(2, '0')}'`;
  };

  return formatTime(timeLeft);
}

export const scrollLeft = (scrollContainer: HTMLDivElement | null) => {
  if (scrollContainer) {
    const cardWidth = scrollContainer.clientWidth / 4; // Adjust based on visible cards
    scrollContainer.scrollBy({
      left: -cardWidth,
      behavior: 'smooth'
    });
  }
};

export const scrollRight = (scrollContainer: HTMLDivElement | null) => {
  if (scrollContainer) {
    const cardWidth = scrollContainer.clientWidth / 4; // Adjust based on visible cards
    scrollContainer.scrollBy({
      left: cardWidth,
      behavior: 'smooth'
    });
  }
};