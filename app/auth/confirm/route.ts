import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const token_hash = searchParams.get('token_hash');
	const type = searchParams.get('type') as EmailOtpType | null;
	const next = searchParams.get('next') ?? '/';
	console.log('Token Hash:', token_hash, 'Type:', type);

	if (token_hash && type) {
		const supabase = await createClient();

		const { error, data: session } = await supabase.auth.verifyOtp({
			type,
			token_hash,
		});

		if (!error && session) {
			const { user } = session;
			if (user) {
				const existingUser = await prisma.user.findUnique({
					where: {
						email: user.email,
					},
				});

				if (!existingUser) {
					await prisma.user.create({
						data: {
							email: user.user_metadata.email,
							name: user.user_metadata.full_name,
						},
					});
				}
			}

			redirect(next);
		}
	}

	// redirect the user to an error page with some instructions
	redirect('/error');
}
