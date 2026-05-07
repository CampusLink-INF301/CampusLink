import { useEffect, useState } from 'react';

interface Props {
  deadline: string | Date;
  onExpired?: () => void;
}

function getSecondsLeft(deadline: string | Date): number {
  return Math.max(0, Math.floor((new Date(deadline).getTime() - Date.now()) / 1000));
}

export function DeadlineWarning({ deadline, onExpired }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsLeft(deadline));

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpired?.();
      return;
    }
    const timer = setInterval(() => {
      const left = getSecondsLeft(deadline);
      setSecondsLeft(left);
      if (left === 0) {
        clearInterval(timer);
        onExpired?.();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline, onExpired, secondsLeft]);

  if (secondsLeft <= 0) {
    return (
      <p className="deadline-warning deadline-expired" data-testid="deadline-expired">
        ¡El plazo ha vencido!
      </p>
    );
  }

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  return (
    <p className="deadline-warning" data-testid="deadline-warning">
      Cierra en: {hours > 0 ? `${hours}h ` : ''}
      {String(minutes).padStart(2, '0')}m {String(seconds).padStart(2, '0')}s
    </p>
  );
}
