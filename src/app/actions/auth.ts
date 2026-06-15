'use server';

import bcrypt from 'bcryptjs';
import { connectToDatabase, isMockDb } from '@/lib/db';
import User from '@/lib/models/User';
import { mockDb } from '@/lib/mockData';
import { createSession, deleteSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export type ActionState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    form?: string;
  };
  success?: boolean;
  message?: string;
};

export async function signup(prevState: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const errors: ActionState['errors'] = {};

  if (!name || name.trim().length < 2) {
    errors.name = ['Name must be at least 2 characters long.'];
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = ['Please enter a valid email address.'];
  }
  if (!password || password.length < 6) {
    errors.password = ['Password must be at least 6 characters long.'];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  await connectToDatabase();

  const lowercaseEmail = email.toLowerCase();
  let userExists = false;
  let hashedPassword = '';

  try {
    hashedPassword = await bcrypt.hash(password, 10);

    if (isMockDb()) {
      const existing = await mockDb.getUserByEmail(lowercaseEmail);
      if (existing) userExists = true;
    } else {
      const existing = await User.findOne({ email: lowercaseEmail });
      if (existing) userExists = true;
    }

    if (userExists) {
      return {
        errors: { email: ['An account with this email already exists.'] }
      };
    }

    let newUser;
    if (isMockDb()) {
      newUser = await mockDb.addUser({
        name,
        email: lowercaseEmail,
        passwordHash: hashedPassword,
        role: 'customer'
      });
    } else {
      newUser = await User.create({
        name,
        email: lowercaseEmail,
        passwordHash: hashedPassword,
        role: 'customer'
      });
    }

    await createSession(newUser._id.toString(), newUser.role, newUser.name);
  } catch (error: any) {
    console.error('Signup error:', error);
    return {
      errors: { form: 'Something went wrong during registration. Please try again.' }
    };
  }

  redirect('/products');
}

export async function login(prevState: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const errors: ActionState['errors'] = {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = ['Please enter a valid email address.'];
  }
  if (!password || password.length === 0) {
    errors.password = ['Password is required.'];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  await connectToDatabase();

  const lowercaseEmail = email.toLowerCase();
  let user: any = null;

  console.log('[LOGIN] isMockDb:', isMockDb(), '| email:', lowercaseEmail);

  try {
    if (isMockDb()) {
      user = await mockDb.getUserByEmail(lowercaseEmail);
    } else {
      user = await User.findOne({ email: lowercaseEmail }).lean();
    }

    console.log('[LOGIN] user found:', !!user, user ? `role=${user.role}` : 'NOT FOUND');
    if (!user) {
      return {
        errors: { form: 'Invalid email or password.' }
      };
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return {
        errors: { form: 'Invalid email or password.' }
      };
    }

    await createSession(user._id.toString(), user.role, user.name);
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      errors: { form: 'Something went wrong during login. Please try again.' }
    };
  }

  // Redirect based on role
  if (user?.role === 'admin') {
    redirect('/admin');
  }
  redirect('/');
}

export async function logout() {
  await deleteSession();
  redirect('/');
}
