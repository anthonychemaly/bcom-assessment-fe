import { ReactNode } from 'react';
import { useIdleTimeout, IdleState, useExtendSession } from '../../hooks';
import { useLogout } from '../../hooks';
import { SessionWarningBanner } from '../SessionWarningBanner';
import { SessionExpiringModal } from '../SessionExpiringModal';

interface IdleTimeoutManagerProps {
  children: ReactNode;
}

export function IdleTimeoutManager({ children }: IdleTimeoutManagerProps) {
  const logoutMutation = useLogout();

  const { idleState, remainingTime, resetTimer } = useIdleTimeout({
    warningTime: 2 * 60 * 1000, // 2 minutes
    expiringTime: 3 * 60 * 1000, // 3 minutes
    logoutTime: 5 * 60 * 1000, // 5 minutes
    onLogout: () => logoutMutation.mutate(),
  });

  const extendSessionMutation = useExtendSession({ onSuccess: () => resetTimer() });

  const handleExtend = async () => {
    try {
      extendSessionMutation.mutate();
    } catch (error) {
      console.error('Failed to extend session:', error);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <>
      {idleState === IdleState.WARNING && (
        <SessionWarningBanner remainingTime={remainingTime} onExtend={resetTimer} />
      )}

      <SessionExpiringModal
        isOpen={idleState === IdleState.EXPIRING}
        remainingTime={remainingTime}
        onExtend={handleExtend}
        onLogout={handleLogout}
      />

      {children}
    </>
  );
}
