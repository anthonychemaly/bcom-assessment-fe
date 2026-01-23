import { useEffect, useRef, useState, useCallback } from 'react';
import { AuthService } from '../network';

export enum IdleState {
  ACTIVE = 'active',
  WARNING = 'warning',
  EXPIRING = 'expiring',
  EXPIRED = 'expired',
}

interface UseIdleTimeoutOptions {
  warningTime: number; // milliseconds until warning (2 minutes)
  expiringTime: number; // milliseconds until expiring modal (3 minutes)
  logoutTime: number; // milliseconds until auto logout (5 minutes)
  onLogout: () => void;
}

interface UseIdleTimeoutReturn {
  idleState: IdleState;
  remainingTime: number;
  extendSession: () => Promise<void>;
  resetTimer: () => void;
}

/**
 * Custom hook to track user idle time and trigger warnings/logout
 * 
 * Optimization Strategy:
 * - Uses refs to prevent re-initialization when state/callbacks change
 * - Event listeners are bound once on mount, not on every state change
 * - Dynamically calculates remaining time based on timer configuration
 * - Throttles activity detection to avoid excessive resets
 */
export function useIdleTimeout({
  warningTime = 2 * 60 * 1000, // 2 minutes
  expiringTime = 3 * 60 * 1000, // 3 minutes
  logoutTime = 5 * 60 * 1000, // 5 minutes
  onLogout,
}: UseIdleTimeoutOptions): UseIdleTimeoutReturn {
  const [idleState, setIdleState] = useState<IdleState>(IdleState.ACTIVE);
  const [remainingTime, setRemainingTime] = useState(0);
  
  // Use separate refs for each timer level to prevent conflicts
  const warningTimeoutRef = useRef<number>(0);
  const expiringTimeoutRef = useRef<number>(0);
  const logoutTimeoutRef = useRef<number>(0);
  const countdownRef = useRef<number>(0);
  const lastActivityRef = useRef<number>(Date.now());
  
  // Optimization: Use refs to prevent unnecessary re-renders and re-initializations
  // - idleStateRef: Prevents event listeners from re-binding on state changes
  // - onLogoutRef: Prevents resetTimer from changing when parent component re-renders
  const idleStateRef = useRef<IdleState>(IdleState.ACTIVE);
  const onLogoutRef = useRef(onLogout);
  
  // Keep refs synchronized with latest values
  useEffect(() => {
    idleStateRef.current = idleState;
  }, [idleState]);
  
  useEffect(() => {
    onLogoutRef.current = onLogout;
  }, [onLogout]);

  // Reset the idle timer
  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIdleState(IdleState.ACTIVE);
    setRemainingTime(0);

    // Clear all existing timers
    if (warningTimeoutRef.current) {
      window.clearTimeout(warningTimeoutRef.current);
    }
    if (expiringTimeoutRef.current) {
      window.clearTimeout(expiringTimeoutRef.current);
    }
    if (logoutTimeoutRef.current) {
      window.clearTimeout(logoutTimeoutRef.current);
    }
    if (countdownRef.current) {
      window.clearInterval(countdownRef.current);
    }

    // Set warning timer
    warningTimeoutRef.current = window.setTimeout(() => {
      const timeUntilExpiring = Math.ceil((expiringTime - warningTime) / 1000);
      setIdleState(IdleState.WARNING);
      setRemainingTime(timeUntilExpiring);
      
      // Start countdown
      countdownRef.current = window.setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) {
              window.clearInterval(countdownRef.current);
              countdownRef.current = 0;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Set expiring timer
      expiringTimeoutRef.current = window.setTimeout(() => {
        const timeUntilLogout = Math.ceil((logoutTime - expiringTime) / 1000);
        
        // Clear the old countdown before starting new one
        const oldCountdown = countdownRef.current;
        if (oldCountdown) {
          window.clearInterval(oldCountdown);
          countdownRef.current = 0;
        }
        
        // Set state after clearing
        setIdleState(IdleState.EXPIRING);
        setRemainingTime(timeUntilLogout);

        // Start new countdown with slight delay to ensure state is updated
        setTimeout(() => {
          countdownRef.current = window.setInterval(() => {
            setRemainingTime((prev) => {
              if (prev <= 1) {
                if (countdownRef.current) {
                  window.clearInterval(countdownRef.current);
                  countdownRef.current = 0;
                }
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }, 10);

        // Set logout timer
        logoutTimeoutRef.current = window.setTimeout(() => {
          setIdleState(IdleState.EXPIRED);
          if (countdownRef.current) {
            window.clearInterval(countdownRef.current);
            countdownRef.current = 0;
          }
          onLogoutRef.current();
        }, logoutTime - expiringTime);
      }, expiringTime - warningTime);
    }, warningTime);
  }, [warningTime, expiringTime, logoutTime]);

  // Extend session by pinging the API
  const extendSession = useCallback(async () => {
    try {
      await AuthService.ping();
      resetTimer();
    } catch (error) {
      console.error('Failed to extend session:', error);
      throw error;
    }
  }, [resetTimer]);

  // Track user activity - initialize once
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

    const handleActivity = () => {
      // Only reset if in active state or warning state (use ref to avoid re-initialization)
      if (idleStateRef.current === IdleState.ACTIVE || idleStateRef.current === IdleState.WARNING) {
        // Throttle resets to avoid too many calls (reset at most once per second)
        const now = Date.now();
        if (now - lastActivityRef.current > 1000) {
          resetTimer();
        }
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Initial timer setup
    resetTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      // Clear all timers on cleanup
      if (warningTimeoutRef.current) {
        window.clearTimeout(warningTimeoutRef.current);
      }
      if (expiringTimeoutRef.current) {
        window.clearTimeout(expiringTimeoutRef.current);
      }
      if (logoutTimeoutRef.current) {
        window.clearTimeout(logoutTimeoutRef.current);
      }
      if (countdownRef.current) {
        window.clearInterval(countdownRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    idleState,
    remainingTime,
    extendSession,
    resetTimer,
  };
}
