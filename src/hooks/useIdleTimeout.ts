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

export function useIdleTimeout({
  warningTime = 2 * 60 * 1000, // 2 minutes
  expiringTime = 3 * 60 * 1000, // 3 minutes
  logoutTime = 5 * 60 * 1000, // 5 minutes
  onLogout,
}: UseIdleTimeoutOptions): UseIdleTimeoutReturn {
  const [idleState, setIdleState] = useState<IdleState>(IdleState.ACTIVE);
  const [remainingTime, setRemainingTime] = useState(0);
  
  const timeoutRef = useRef<number>(0);
  const countdownRef = useRef<number>(0);
  const lastActivityRef = useRef<number>(Date.now());

  // Reset the idle timer
  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIdleState(IdleState.ACTIVE);
    setRemainingTime(0);

    // Clear existing timers
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    if (countdownRef.current) {
      window.clearInterval(countdownRef.current);
    }

    // Set warning timer (2 minutes)
    timeoutRef.current = window.setTimeout(() => {
      setIdleState(IdleState.WARNING);
      setRemainingTime(60); // 60 seconds remaining
      
      // Start countdown
      countdownRef.current = window.setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) {
              window.clearInterval(countdownRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Set expiring timer (3 minutes from start)
      timeoutRef.current = window.setTimeout(() => {
        setIdleState(IdleState.EXPIRING);
        setRemainingTime(30); // 30 seconds remaining
        
        if (countdownRef.current) {
          window.clearInterval(countdownRef.current);
        }

        // Start countdown
        countdownRef.current = window.setInterval(() => {
          setRemainingTime((prev) => {
            if (prev <= 1) {
              if (countdownRef.current) {
                window.clearInterval(countdownRef.current);
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Set logout timer (5 minutes from start)
        timeoutRef.current = window.setTimeout(() => {
          setIdleState(IdleState.EXPIRED);
          if (countdownRef.current) {
            window.clearInterval(countdownRef.current);
          }
          onLogout();
        }, logoutTime - expiringTime);
      }, expiringTime - warningTime);
    }, warningTime);
  }, [warningTime, expiringTime, logoutTime, onLogout]);

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

  // Track user activity
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

    const handleActivity = () => {
      // Only reset if in active state or warning state
      if (idleState === IdleState.ACTIVE || idleState === IdleState.WARNING) {
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
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      if (countdownRef.current) {
        window.clearInterval(countdownRef.current);
      }
    };
  }, [resetTimer, idleState]);

  return {
    idleState,
    remainingTime,
    extendSession,
    resetTimer,
  };
}
