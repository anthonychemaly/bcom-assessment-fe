import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TextInput,
  PasswordInput,
  Button,
  Text,
  Stack,
  Alert,
  Anchor,
  Box,
  Divider,
  Progress,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import * as Yup from 'yup';
import {
  IconAlertCircle,
  IconUserPlus,
  IconLock,
  IconMail,
  IconCheck,
} from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLayout } from '../../layouts';
import styles from './styles.module.scss';

const registerSchema = Yup.object({
  email: Yup.string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
});

function getPasswordStrength(password: string): { strength: number; label: string; color: string } {
  let strength = 0;
  if (password.length >= 6) strength += 20;
  if (password.length >= 10) strength += 20;
  if (/[a-z]/.test(password)) strength += 20;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[0-9]/.test(password)) strength += 10;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 10;

  if (strength <= 30) return { strength, label: 'Weak', color: 'red' };
  if (strength <= 60) return { strength, label: 'Fair', color: 'orange' };
  if (strength <= 80) return { strength, label: 'Good', color: 'yellow' };
  return { strength, label: 'Strong', color: 'green' };
}

export function RegisterPage() {
  const { register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      confirmPassword: '',
    },
    validate: (values) => {
      try {
        registerSchema.validateSync(values, { abortEarly: false });
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

  const handleSubmit = form.onSubmit(async (values) => {
    const { confirmPassword, ...registerData } = values;
    setIsSubmitting(true);
    setError(null);
    try {
      await register(registerData);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  });

  const passwordStrength = getPasswordStrength(form.values.password);

  const passwordRequirements = [
    { regex: /.{6,}/, label: 'At least 6 characters' },
    { regex: /[A-Z]/, label: 'One uppercase letter' },
    { regex: /[a-z]/, label: 'One lowercase letter' },
    { regex: /[0-9]/, label: 'One number' },
  ];

  return (
    <AuthLayout title="Create Account" subtitle="Join us today and get started">
      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          <TextInput
            label="Email"
            placeholder="your.email@example.com"
            size="md"
            leftSection={<IconMail size={18} />}
            type="email"
            required
            {...form.getInputProps('email')}
            disabled={isSubmitting}
            autoComplete="email"
            aria-label="Email"
            classNames={{ input: styles.input }}
          />

          <div>
            <PasswordInput
              label="Password"
              placeholder="Create a strong password"
              size="md"
              leftSection={<IconLock size={18} />}
              required
              {...form.getInputProps('password')}
              disabled={isSubmitting}
              autoComplete="new-password"
              aria-label="Password"
              classNames={{ input: styles.input }}
            />
            {form.values.password && (
              <Box mt="xs">
                <Progress
                  value={passwordStrength.strength}
                  color={passwordStrength.color}
                  size="sm"
                  radius="xl"
                  mb="xs"
                />
                <Text size="xs" c={passwordStrength.color} fw={600}>
                  Password strength: {passwordStrength.label}
                </Text>
                <Stack gap={4} mt="xs">
                  {passwordRequirements.map((req, index) => {
                    const meets = req.regex.test(form.values.password);
                    return (
                      <Text
                        key={index}
                        size="xs"
                        c={meets ? 'teal' : 'dimmed'}
                        className={styles.requirement}
                      >
                        {meets ? <IconCheck size={12} /> : '○'} {req.label}
                      </Text>
                    );
                  })}
                </Stack>
              </Box>
            )}
          </div>

          <PasswordInput
            label="Confirm Password"
            placeholder="Re-enter your password"
            size="md"
            leftSection={<IconLock size={18} />}
            required
            {...form.getInputProps('confirmPassword')}
            disabled={isSubmitting}
            autoComplete="new-password"
            aria-label="Confirm Password"
            classNames={{ input: styles.input }}
          />

          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Registration Failed"
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
            aria-label="Create account"
            leftSection={<IconUserPlus size={20} />}
            className={styles.submitButton}
          >
            Create Account
          </Button>

          <Divider label="Already have an account?" labelPosition="center" />

          <Box ta="center">
            <Text size="sm" c="dimmed" span>
              Already registered?{' '}
            </Text>
            <Anchor component={Link} to="/login" size="sm" fw={600}>
              Sign in
            </Anchor>
          </Box>
        </Stack>
      </form>
    </AuthLayout>
  );
}
