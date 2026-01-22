import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Alert,
  Anchor,
  Box,
  Divider,
  Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import * as Yup from 'yup';
import { IconAlertCircle, IconLogin, IconLock, IconMail } from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLayout } from '../../layouts';
import styles from './styles.module.scss';

const loginSchema = Yup.object({
  email: Yup.string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: (values) => {
      try {
        loginSchema.validateSync(values, { abortEarly: false });
        return {};
      } catch (error) {
        if (error instanceof Yup.ValidationError) {
          const errors: Record<string, string> = {};
          error.inner.forEach((err) => {
            if (err.path) {
              errors[err.path] = err.message;
            }
          });
          return errors;
        }
        return {};
      }
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await login(values);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your account to continue">
      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          <TextInput
            label="Email"
            placeholder="your.email@example.com"
            size="md"
            type="email"
            leftSection={<IconMail size={18} />}
            required
            {...form.getInputProps('email')}
            disabled={isSubmitting}
            autoComplete="email"
            aria-label="Email"
            classNames={{ input: styles.input }}
          />

          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            size="md"
            leftSection={<IconLock size={18} />}
            required
            {...form.getInputProps('password')}
            disabled={isSubmitting}
            autoComplete="current-password"
            aria-label="Password"
            classNames={{ input: styles.input }}
          />

          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Login Failed"
              color="red"
              role="alert"
              variant="light"
              radius="md"
            >
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={isSubmitting}
            aria-label="Login"
            leftSection={<IconLogin size={20} />}
            className={styles.submitButton}
          >
            Sign In
          </Button>

          <Divider label="New here?" labelPosition="center" />

          <Box ta="center">
            <Text size="sm" c="dimmed" span>
              Don't have an account?{' '}
            </Text>
            <Anchor component={Link} to="/register" size="sm" fw={600}>
              Create account
            </Anchor>
          </Box>
        </Stack>
      </form>
    </AuthLayout>
  );
}
