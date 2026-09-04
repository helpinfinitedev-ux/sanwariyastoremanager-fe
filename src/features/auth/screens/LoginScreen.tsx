import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from '@/web/primitives';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLogin } from '../hooks/useAuth';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { spacing } from '../../../shared/theme/themes';
import Input from '../../../shared/components/ui/Input';
import Button from '../../../shared/components/ui/Button';
import Card from '../../../shared/components/ui/Card';
import { storage } from '../../../storage/mmkv';
import { Ionicons } from '@/web/icons';

const loginSchema = z.object({
  mobileNumber: z
    .string()
    .min(1, 'Mobile number is required')
    .regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const REMEMBERED_MOBILE_KEY = 'remembered_user_mobile';

export const LoginScreen: React.FC = () => {
  const { colors } = useTheme();
  const loginMutation = useLogin();
  const [secureText, setSecureText] = useState(true);
  const [rememberMe, setRememberMe] = useState(() => {
    return !!storage.getString(REMEMBERED_MOBILE_KEY);
  });

  const defaultMobile = storage.getString(REMEMBERED_MOBILE_KEY) || '';

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: {
      mobileNumber: defaultMobile,
      password: '',
    },
  });

  const handleQuickFill = (mobile: string, pass: string) => {
    setValue('mobileNumber', mobile, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
  };

  const onSubmit = (data: LoginFormValues) => {
    if (rememberMe) {
      storage.set(REMEMBERED_MOBILE_KEY, data.mobileNumber);
    } else {
      storage.delete(REMEMBERED_MOBILE_KEY);
    }

    loginMutation.mutate({
      mobileNumber: data.mobileNumber,
      password: data.password,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.brand, { color: colors.primary }]}>SANWARIYA ERP</Text>
            <Text style={[styles.title, { color: colors.text }]}>Store Manager Log In</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Enter mobile credentials to access inventory and store metrics
            </Text>
          </View>

          <Card style={styles.card}>
            {/* Inline Mutation Error Banner */}
            {loginMutation.isError && (
              <View
                style={[
                  styles.errorBanner,
                  { backgroundColor: colors.dangerBg, borderColor: colors.danger },
                ]}
              >
                <Ionicons name="alert-circle" size={20} color={colors.danger} />
                <Text style={[styles.errorBannerText, { color: colors.danger }]}>
                  {loginMutation.error?.message || 'Login failed. Please try again.'}
                </Text>
              </View>
            )}

            {/* Mobile Number Input */}
            <View style={styles.inputGroup}>
              <Controller
                control={control}
                name="mobileNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Mobile Number"
                    placeholder="Enter 10-digit mobile number"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.mobileNumber?.message}
                    keyboardType="numeric"
                    maxLength={10}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}
              />
            </View>

            {/* Password Input with Show/Hide visibility next to Label */}
            <View style={styles.inputGroup}>
              <View style={styles.passwordHeaderRow}>
                <Text style={[styles.labelOverride, { color: colors.textSecondary }]}>Password</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setSecureText(!secureText)}
                  style={styles.visibilityToggle}
                >
                  <Ionicons
                    name={secureText ? 'eye-off-outline' : 'eye-outline'}
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={[styles.visibilityToggleText, { color: colors.primary }]}>
                    {secureText ? 'Show' : 'Hide'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="••••••••"
                    secureTextEntry={secureText}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.password?.message}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}
              />
            </View>

            {/* Remember Me simulated select */}
            <View style={styles.rememberRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setRememberMe(!rememberMe)}
                style={styles.checkboxContainer}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: colors.border,
                      backgroundColor: rememberMe ? colors.primary : 'transparent',
                    },
                  ]}
                >
                  {rememberMe && <Ionicons name="checkmark" size={12} color={colors.background} />}
                </View>
                <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                  Remember Mobile Number
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              title="Log In"
              onPress={handleSubmit(onSubmit as any)}
              loading={loginMutation.isPending}
              style={styles.submitBtn}
            />
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  brand: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  card: {
    width: '100%',
    padding: spacing.xl,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  errorBannerText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  passwordHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelOverride: {
    fontSize: 12,
    fontWeight: '500',
  },
  visibilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  visibilityToggleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 13,
  },
  submitBtn: {
    width: '100%',
    height: 40,
    marginTop: spacing.sm,
  },
  helpBox: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.sm,
  },
  helpTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  quickFillContainer: {
    gap: spacing.xs,
  },
  quickFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    gap: spacing.sm,
  },
  quickFillContent: {
    flex: 1,
  },
  quickFillRole: {
    fontSize: 12,
    fontWeight: '700',
  },
  quickFillCreds: {
    fontSize: 11,
    marginTop: 1,
  },
});

export default LoginScreen;
