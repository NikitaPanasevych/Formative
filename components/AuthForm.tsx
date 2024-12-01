'use client';

import AlertDialogComponent from './AlertDialogComponent';
import Link from 'next/link';
import React, { useState } from 'react';
//utils
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
//shadcn
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
//server actions
import signInWithGoogle, { login, resendConfirmationEmail, signInWithGithub, signup } from '@/lib/actions/login';
//icons
import { FaGoogle } from 'react-icons/fa';
import { FaGithub } from 'react-icons/fa';

const authFormSchema = (type: string) => {
	return z.object({
		email: z.string().email(),
		password: z.string().min(5).max(50),
		name: type !== 'login' ? z.string().min(2).max(50) : z.string().optional(),
	});
};

const AuthForm = ({ type }: { type: string }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [isEmailConfirmationOpen, setIsEmailConfirmationOpen] = useState(true);

	const handleResendConfirmation = async (email: string) => {
		setIsLoading(true);
		try {
			await resendConfirmationEmail(email);
		} catch (error) {
			console.error('Error during resending confirmation:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const formSchema = authFormSchema(type);
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			password: '',
			name: '',
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		const { email, password, name } = values;
		console.log('Form values:', values);
		setIsLoading(true);
		setErrorMessage('');

		try {
			if (type === 'login') {
				await login({ email, password });
			} else if (type === 'register') {
				await signup({ email, password, name });
				setIsEmailConfirmationOpen(true);
			}
		} catch (error: any) {
			if (error.message) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage('An unexpected error occurred. Please try again.');
			}
			console.error('Error during submission:', error);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<>
			<CardHeader className=" pb-2">
				<CardTitle className=" text-xl">{type === 'login' ? 'Login' : 'Register'}</CardTitle>
				<CardDescription>Enter your credentials below to continue</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form className="space-y-6 mb-2" onSubmit={form.handleSubmit(onSubmit)}>
						{type === 'register' && (
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem className=" my-4">
										<FormLabel>Username</FormLabel>
										<FormControl>
											<Input placeholder="Username" {...field} />
										</FormControl>
										<FormMessage className="text-red body-2 ml-2" />
									</FormItem>
								)}
							/>
						)}
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem className=" my-4">
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input placeholder="Email" {...field} />
									</FormControl>
									<FormMessage className="text-red body-2 ml-2" />
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
										<Input type="password" placeholder="Password" {...field} />
									</FormControl>
									<FormMessage className="text-red body-2 ml-2" />
								</FormItem>
							)}
						/>
						<Button className=" w-full" disabled={isLoading} type="submit">
							{type !== 'login' ? 'Register' : 'Login'} {isLoading && <p>LOADING...</p>}
						</Button>
						{errorMessage && <p className="  mx-auto rounded-xl text-center text-error">*{errorMessage}</p>}
						{errorMessage === 'Email not confirmed' && (
							<AlertDialogComponent
								type="emailConfirmation"
								isLoading={isLoading}
								handleResendConfirmation={() => handleResendConfirmation(form.getValues().email)}
							/>
						)}
					</form>
				</Form>

				<div className="body-2 flex justify-center pt-2">
					<p className="text-light-100">
						{type === 'login' ? "Don't have an account?" : 'Already have an account?'}
					</p>
					<Link href={type === 'login' ? '/register' : '/login'} className="ml-1 font-medium text-brand">
						{' '}
						{type === 'login' ? 'Register' : 'Login'}
					</Link>
				</div>
				<Separator className=" my-4 px-6 " />
				<div className=" px-6 flex flex-1 justify-between gap-6">
					<Button onClick={() => signInWithGoogle()} className=" w-full font-bold" variant="outline">
						<FaGoogle />
						Google
					</Button>
					<Button onClick={() => signInWithGithub()} className=" w-full font-bold" variant="outline">
						<FaGithub />
						GitHub
					</Button>
				</div>
			</CardContent>
			{isEmailConfirmationOpen && (
				<AlertDialogComponent
					type="emailConfirmation"
					isLoading={isLoading}
					handleResendConfirmation={() => handleResendConfirmation(form.getValues().email)}
				/>
			)}
		</>
	);
};

export default AuthForm;
