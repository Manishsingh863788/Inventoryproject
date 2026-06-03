"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import { LoginSchema, RegisterSchema } from "@/lib/validations";

export type AuthState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
        general?: string[];
      };
      message?: string;
      success?: boolean;
      redirectTo?: string;
    }
  | undefined;

// ─── Login ────────────────────────────────────────────────────────────────

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validated = LoginSchema.safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;



  // Fetch user
  let user: { id: string; name: string; email: string; password: string; role: string } | null = null;
  try {
    user = await prisma.user.findUnique({ where: { email } }) as typeof user;
  } catch (err) {
    console.error("[login] DB error:", err);
    return { errors: { general: ["Database error. Please try again."] } };
  }

  if (!user) {
    return { errors: { general: ["Invalid email or password"] } };
  }

  // Compare password hash
  let passwordMatch = false;
  try {
    passwordMatch = await bcrypt.compare(password, user.password);
  } catch (err) {
    console.error("[login] bcrypt error:", err);
    return { errors: { general: ["Authentication error. Please try again."] } };
  }

  if (!passwordMatch) {
    return { errors: { general: ["Invalid email or password"] } };
  }

  const role = user.role as "ADMIN" | "USER";

  await createSession({
    userId: user.id,
    role,
    email: user.email,
    name: user.name,
  });

  const redirectPath = role === "ADMIN" ? "/admin" : "/dashboard";
  
  // Return success state for client-side handling
  return { 
    success: true, 
    redirectTo: redirectPath,
    message: "Login successful" 
  };
}

// ─── Register ─────────────────────────────────────────────────────────────

export async function register(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validated = RegisterSchema.safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { name, email, password } = validated.data;

  let existing: { id: string } | null = null;
  try {
    existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    }) as typeof existing;
  } catch (err) {
    console.error("[register] DB error:", err);
    return { errors: { general: ["Database error. Please try again."] } };
  }

  if (existing) {
    return { errors: { email: ["An account with this email already exists"] } };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  let newUser: { id: string; name: string; email: string; role: string } | null = null;
  try {
    newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: "USER" },
    }) as typeof newUser;
  } catch (err) {
    console.error("[register] Create error:", err);
    return { errors: { general: ["Failed to create account. Please try again."] } };
  }

  await createSession({
    userId: newUser!.id,
    role: newUser!.role as "ADMIN" | "USER",
    email: newUser!.email,
    name: newUser!.name,
  });

  return { 
    success: true, 
    redirectTo: "/dashboard",
    message: "Account created successfully" 
  };
}

// ─── Logout ───────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
