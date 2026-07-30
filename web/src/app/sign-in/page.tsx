'use client';

/**
 * Sign-in screen (/sign-in) — the app's single entry point.
 *
 * Validates the entered credentials against the seeded-users fixture via the
 * simulated SessionProvider (no backend, no API client). A wrong email/password
 * shows an inline error and keeps the user here; a valid seeded pair establishes
 * the client-side session and routes to the role's landing screen. There is no
 * sign-up or password-reset flow — only the three demo accounts exist.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from '@/contexts/SessionContext';
import { landingRouteForRole } from '@/lib/fixtures/users';
import { signInSchema, type SignInInput } from '@/lib/validation/schemas';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export default function SignInPage() {
  const router = useRouter();
  const { user, signIn } = useSession();
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  // Once a session exists (fresh sign-in, or landing here while already signed
  // in), route to the active role's landing screen.
  useEffect(() => {
    if (user) {
      router.replace(landingRouteForRole(user.role));
    }
  }, [user, router]);

  function onSubmit(values: SignInInput) {
    setAuthError(null);
    const result = signIn(values.email, values.password);
    if (!result.ok) {
      setAuthError(result.error ?? 'Sign-in failed. Please try again.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-2">
          <h1 className="text-2xl font-semibold leading-none">Sign in</h1>
          <CardDescription>
            Sign in with one of the seeded accounts to continue.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              {authError && (
                <div
                  role="alert"
                  className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {authError}
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="visitor@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter>
          <p className="text-xs text-muted-foreground">
            This is a demo / prototype auth layer for evaluation only — it is
            not production-grade security. Three seeded accounts exist
            (visitor@example.com, agent@example.com, admin@example.com), all
            with the password <span className="font-medium">Test123</span>.
            There is no sign-up or password reset.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
