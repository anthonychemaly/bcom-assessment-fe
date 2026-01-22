import { Component, ReactNode, ErrorInfo } from 'react';
import { Container, Title, Text, Button, Stack, Paper } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container size="sm" style={{ marginTop: '5rem' }}>
          <Paper withBorder shadow="md" p="xl" radius="md">
            <Stack gap="lg" align="center">
              <IconAlertTriangle size={64} color="var(--mantine-color-red-6)" />
              <Title order={2}>Something went wrong</Title>
              <Text c="dimmed" ta="center">
                An unexpected error occurred. Please try refreshing the page or contact support if
                the problem persists.
              </Text>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Paper withBorder p="md" style={{ width: '100%', overflowX: 'auto' }}>
                  <Text size="xs" c="red" style={{ fontFamily: 'monospace' }}>
                    {this.state.error.toString()}
                  </Text>
                </Paper>
              )}
              <Button onClick={this.handleReset}>Return to Home</Button>
            </Stack>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}
