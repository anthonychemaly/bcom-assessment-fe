import { Alert, Button, Group, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import styles from './styles.module.scss';

interface SessionWarningBannerProps {
  remainingTime: number;
  onExtend: () => void;
}

export function SessionWarningBanner({ remainingTime, onExtend }: SessionWarningBannerProps) {
  return (
    <Alert
      icon={<IconAlertTriangle size={16} />}
      title="Session Inactivity Warning"
      color="yellow"
      className={styles.banner}
      withCloseButton={false}
    >
      <Group justify="space-between" align="center">
        <Text size="sm">
          Your session will expire in <strong>{remainingTime} seconds</strong> due to inactivity.
          Move your mouse or press any key to continue your session.
        </Text>
        <Button size="xs" variant="light" onClick={onExtend}>
          Stay Active
        </Button>
      </Group>
    </Alert>
  );
}
