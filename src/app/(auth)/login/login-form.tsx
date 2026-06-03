"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, LogIn, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Handle redirect after successful login
  useEffect(() => {
    if (state?.success && state.redirectTo) {
      console.log("LOGIN SUCCESS - Redirecting to:", state.redirectTo);
      router.push(state.redirectTo);
    }
    if (state?.errors) {
      console.log("LOGIN ERROR:", state.errors);
    }
  }, [state, router]);

  return (
    <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
      <form action={action}>
        <CardContent className="pt-6 space-y-4">
          {/* Success message */}
          {state?.success && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-2 text-sm border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{state.message || "Login successful, redirecting..."}</span>
            </div>
          )}

          {/* General errors */}
          {state?.errors?.general && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 text-destructive px-3 py-2 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{state.errors.general[0]}</span>
            </div>
          )}

          {/* Success message */}
          {state?.success && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-2 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Login successful! Redirecting...</span>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@example.com"
              autoComplete="email"
              required
              className={cn(state?.errors?.email && "border-destructive")}
            />
            {state?.errors?.email && (
              <p className="text-xs text-destructive">{state.errors.email[0]}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className={cn(
                  "pr-10",
                  state?.errors?.password && "border-destructive"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {state?.errors?.password && (
              <p className="text-xs text-destructive">
                {state.errors.password[0]}
              </p>
            )}
          </div>

          {/* Demo credentials */}
          <div className="rounded-lg bg-muted/60 p-3 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Demo Credentials</p>
            <p className="text-xs text-muted-foreground">Admin: admin@example.com / Admin123@</p>
            <p className="text-xs text-muted-foreground">User: user@example.com / User123@</p>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          <Button type="submit" disabled={pending} className="w-full gap-2">
            {pending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Sign in
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary font-medium hover:underline"
            >
              Create one
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
