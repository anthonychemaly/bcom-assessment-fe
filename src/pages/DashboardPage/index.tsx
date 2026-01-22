import { Container, Title, Paper, Text, Group, Badge, Button, Stack, Card } from '@mantine/core';
import { IconLogout, IconUser } from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLogout } from '../../hooks';
import styles from './styles.module.scss';

export function DashboardPage() {
  const { user, userRole } = useAuth();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className={styles.pageWrapper}>
      <Container size="lg" className={styles.container}>
        <Paper withBorder shadow="md" p="xl" radius="md">
          <Stack gap="xl">
            <Group justify="space-between" align="center">
              <Title order={1}>Dashboard</Title>
              <Button
                leftSection={<IconLogout size={16} />}
                variant="light"
                color="red"
                onClick={handleLogout}
                loading={logoutMutation.isPending}
                aria-label="Logout"
              >
                Logout
              </Button>
            </Group>

            <Card withBorder padding="lg" radius="md" className={styles.userCard}>
              <Stack gap="md">
                <Group gap="sm">
                  <IconUser size={24} />
                  <Title order={3}>User Information</Title>
                </Group>

                <div className={styles.infoGrid}>
                  <div>
                    <Text size="sm" c="dimmed" fw={500}>
                      Email
                    </Text>
                    <Text size="md" fw={600}>
                      {user?.email}
                    </Text>
                  </div>

                  <div>
                    <Text size="sm" c="dimmed" fw={500}>
                      User ID
                    </Text>
                    <Text size="md" fw={600}>
                      #{user?.id}
                    </Text>
                  </div>

                  <div>
                    <Text size="sm" c="dimmed" fw={500}>
                      Role
                    </Text>
                    <Badge
                      variant="light"
                      color={userRole === 'ADMIN' ? 'red' : 'blue'}
                      size="lg"
                    >
                      {userRole || 'USER'}
                    </Badge>
                  </div>
                </div>
              </Stack>
            </Card>

            <Card withBorder padding="lg" radius="md">
              <Stack gap="sm">
                <Title order={4}>Session Information</Title>
                <Text size="sm" c="dimmed">
                  Your session is active and being monitored for inactivity. After 2 minutes of
                  inactivity, you'll see a warning. After 5 minutes, you'll be automatically logged
                  out for security.
                </Text>
              </Stack>
            </Card>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
}
