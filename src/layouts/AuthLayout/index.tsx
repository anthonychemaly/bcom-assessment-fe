import { ReactNode } from 'react';
import { Title, Text } from '@mantine/core';
import styles from './styles.module.scss';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
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
