import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Title, Text, LoadingOverlay, Box } from '@mantine/core';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.scss';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Box pos="relative" h="100vh">
        <LoadingOverlay visible={true} />
      </Box>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formSection}>
        <div className={styles.container}>
          <div className={styles.logoSection}>
            <Title order={1} className={styles.mainTitle}>
              {title}
            </Title>
            <Text c="dimmed" size="lg" mb="xl">
              {subtitle}
            </Text>
          </div>
          {children}
        </div>
      </div>
      <div className={styles.animationSection} />
    </div>
  );
}
