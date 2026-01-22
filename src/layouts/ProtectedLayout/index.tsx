import { AppShell, Burger, Group, Text, NavLink, Stack, LoadingOverlay, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, useNavigate, Navigate, useLocation } from 'react-router-dom';
import {
  IconHome,
  IconUser,
  IconSettings,
  IconLogout,
} from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';

export function ProtectedLayout() {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, isAuthenticated, isLoading } = useAuth();

  // Protected route logic
  if (isLoading) {
    return (
      <Box pos="relative" h="100vh">
        <LoadingOverlay visible={true} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text fw={700} size="lg">
              My App
            </Text>
          </Group>
          {user && (
            <Text size="sm" c="dimmed">
              {user.email}
            </Text>
          )}
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs">
          <NavLink
            label="Dashboard"
            leftSection={<IconHome size={20} />}
            onClick={() => {
              navigate('/dashboard');
              if (opened) toggle();
            }}
          />
          <NavLink
            label="Profile"
            leftSection={<IconUser size={20} />}
            onClick={() => {
              navigate('/profile');
              if (opened) toggle();
            }}
          />
          <NavLink
            label="Settings"
            leftSection={<IconSettings size={20} />}
            onClick={() => {
              navigate('/settings');
              if (opened) toggle();
            }}
          />
          <NavLink
            label="Logout"
            leftSection={<IconLogout size={20} />}
            onClick={handleLogout}
            color="red"
            style={{ marginTop: 'auto' }}
          />
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
