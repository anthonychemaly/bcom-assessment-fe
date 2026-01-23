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
  const extendSessionMutation = useExtendSession();

  const { idleState, remainingTime, extendSession, resetTimer } = useIdleTimeout({
    warningTime: 0.25 * 60 * 1000, // 2 minutes
    expiringTime: 0.5 * 60 * 1000, // 3 minutes
    logoutTime: 1 * 60 * 1000, // 5 minutes
    onLogout: () => logoutMutation.mutate(),
  });

  const handleExtend = async () => {
    try {
      await extendSession();
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
