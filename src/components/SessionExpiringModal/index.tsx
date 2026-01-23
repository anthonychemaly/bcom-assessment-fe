import { Modal, Text, Button, Group, Stack, Progress } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import { useRef, useEffect } from 'react';
import styles from './styles.module.scss';

interface SessionExpiringModalProps {
  isOpen: boolean;
  remainingTime: number;
  onExtend: () => void;
  onLogout: () => void;
}

export function SessionExpiringModal({
  isOpen,
  remainingTime,
  onExtend,
  onLogout,
}: SessionExpiringModalProps) {
  const initialTimeRef = useRef<number>(0);
  
  // Capture initial time when modal first opens
  useEffect(() => {
    if (isOpen && initialTimeRef.current === 0) {
      initialTimeRef.current = remainingTime;
    } else if (!isOpen) {
      initialTimeRef.current = 0;
    }
  }, [isOpen, remainingTime]);
  
  // Calculate progress based on initial time
  const progress = initialTimeRef.current > 0 
    ? Math.max(0, Math.min(100, (remainingTime / initialTimeRef.current) * 100))
    : 100;

  return (
    <Modal
      opened={isOpen}
      onClose={() => {}}
      title="Session Expiring"
      centered
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
      size="md"
      classNames={{ header: styles.modalHeader, title: styles.modalTitle }}
    >
      <Stack gap="lg">
        <div className={styles.iconWrapper}>
          <IconClock size={48} className={styles.icon} />
        </div>

        <Stack gap="xs" align="center">
          <Text size="lg" fw={600} ta="center">
            Your session is about to expire
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            You will be automatically logged out in
          </Text>
          <Text size="xl" fw={700} c="red" ta="center">
            {remainingTime} seconds
          </Text>
        </Stack>

        <Progress
          value={progress}
          color={progress > 50 ? 'yellow' : 'red'}
          size="lg"
          animated
          className={styles.progress}
        />

        <Text size="xs" c="dimmed" ta="center">
          Click "Extend Session" to continue working or "Logout" to end your session now.
        </Text>

        <Group grow>
          <Button
            variant="light"
            color="gray"
            onClick={onLogout}
            aria-label="Logout now"
          >
            Logout
          </Button>
          <Button
            onClick={onExtend}
            aria-label="Extend session"
            autoFocus
          >
            Extend Session
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
