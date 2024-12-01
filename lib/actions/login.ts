'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import prisma from '../prisma';
import { headers } from 'next/headers';
import { getURL } from '../helpers';

const handleError = (error: unknown, message: string) => {
	console.log(error, message);
	throw error;
};

export async function login({ email, password }: { email: string; password: string }) {
	const supabase = await createClient();

	const data = {
		email,
		password,
	};

	const { error } = await supabase.auth.signInWithPassword(data);

	if (error) {
		handleError(error, 'Failed to login');
		return error;
	}

	revalidatePath('/', 'layout');
	redirect('/');
}

export async function signup({ email, password, name }: { email: string; password: string; name: string | undefined }) {
	const supabase = await createClient();

	const existingUser = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	if (existingUser) {
		throw new Error('User already exists.');
	}

	const { error: signUpError } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: {
				full_name: name,
			},
		},
	});

	if (signUpError) {
		throw new Error(signUpError.message || 'Failed to register. Please try again.');
	}
}

export async function logout() {
	const supabase = await createClient();
	const { error } = await supabase.auth.signOut();

	if (error) {
		handleError(error, 'Failed to logout');
		return error;
	}

	revalidatePath('/', 'layout');
	redirect('/');
}

export async function resendConfirmationEmail(email: string) {
	const supabase = await createClient();
	const { error } = await supabase.auth.resend({
		email,
		type: 'signup',
	});

	if (error) {
		handleError(error, 'Failed to resend confirmation email');
		return error;
	}

	return true;
}

export default async function signInWithGoogle() {
	const redirectURL = getURL('/auth/callback');
	const supabase = await createClient();
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: 'google',
		options: {
			redirectTo: redirectURL,
		},
	});
	if (error) {
		redirect('/login?message=Failed to sign in with Google');
	}
	if (data?.url) {
		return redirect(data.url);
	}
}

export async function signInWithGithub() {
	const redirectURL = getURL('/auth/callback');
	const supabase = await createClient();
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: 'github',
		options: {
			redirectTo: redirectURL,
		},
	});
	if (error) {
		redirect('/login?message=Failed to sign in with Github');
	}

	if (data?.url) {
		return redirect(data.url);
	}
}
