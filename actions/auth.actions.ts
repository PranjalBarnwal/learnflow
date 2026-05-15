'use server';

import { hash } from 'bcryptjs';
import { db } from '@/lib/db';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth.schema';

export async function registerUser(data: RegisterInput) {
  try {
    const validated = registerSchema.parse(data);

    const existing = await db.user.findUnique({
      where: { email: validated.email },
    });

    if (existing) {
      return { error: 'Email already registered' };
    }

    const passwordHash = await hash(validated.password, 12);

    const user = await db.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        passwordHash,
        role: validated.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return { success: true, user };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'Registration failed' };
  }
}
