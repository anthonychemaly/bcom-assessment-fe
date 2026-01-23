import { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { useFormik } from 'formik';
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
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setError(null);
      try {
        await login(values);
      } catch (err: any) {
        // For 401 errors, always show "Invalid email or password"
        if (err?.response?.status === 401) {
          setError('Invalid email or password');
        } else {
          // For other errors, use the server message or a generic error
          setError(err?.response?.data?.error || 'An error occurred. Please try again.');
        }
      }
    },
  });

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your account to continue">
      <form onSubmit={formik.handleSubmit}>
        <Stack gap="lg">
          <TextInput
            label="Email"
            placeholder="your.email@example.com"
            size="md"
            type="email"
            leftSection={<IconMail size={18} />}
            required
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && formik.errors.email}
            disabled={formik.isSubmitting}
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
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && formik.errors.password}
            disabled={formik.isSubmitting}
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
            loading={formik.isSubmitting}
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
