"use client";

import { useActionState } from "react";
import { Eye, EyeOff, UserPlus, AlertCircle } from "lucide-react";
import { useState } from "react";
import { register } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
      <form action={action}>
        <CardContent className="pt-6 space-y-4">
          {state?.message && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 text-destructive px-3 py-2 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{state.message}</span>
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              autoComplete="name"
              required
              className={cn(state?.errors?.name && "border-destructive")}
            />
            {state?.errors?.name && (
              <p className="text-xs text-destructive">{state.errors.name[0]}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
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
                autoComplete="new-password"
                required
                className={cn(
                  "pr-10",
                  state?.errors?.password && "border-destructive"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
              <ul className="text-xs text-destructive space-y-0.5">
                {state.errors.password.map((e, i) => (
                  <li key={i}>• {e}</li>
                ))}
              </ul>
            )}
            <p className="text-xs text-muted-foreground">
              8+ chars with letter, number & special character
            </p>
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={pending} className="w-full gap-2">
            {pending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Create account
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
