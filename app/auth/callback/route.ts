import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get('code');
	const next = searchParams.get('next') ?? '/';

	if (code) {
		const supabase = await createClient();

		const { error, data: session } = await supabase.auth.exchangeCodeForSession(code);
		if (!error && session) {
			const { user } = session;
			if (user) {
				const existingUser = await prisma.user.findUnique({
					where: {
						email: user.email,
					},
				});

				if (!existingUser) {
					console.log('Creating new user:', user);
					await prisma.user.create({
						data: {
							email: user.user_metadata.email,
							name: user.user_metadata.name,
						},
					});
				}
			}

			// Determine the redirect URL based on environment
			const forwardedHost = request.headers.get('x-forwarded-host');
			const isLocalEnv = process.env.NODE_ENV === 'development';
			if (isLocalEnv) {
				return NextResponse.redirect(`${origin}${next}`);
			} else if (forwardedHost) {
				return NextResponse.redirect(`https://${forwardedHost}${next}`);
			} else {
				return NextResponse.redirect(`${origin}${next}`);
			}
		}
	}

	// Handle errors during the exchange
	return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
