'use client';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { Button } from './ui/button';

const AlertDialogComponent = ({
	handleResendConfirmation,
	isLoading,
}: {
	handleResendConfirmation?: () => void;
	isLoading?: boolean;
	type: 'emailConfirmation' | 'passwordReset';
}) => {
	const [isOpen, setIsOpen] = useState(true);

	return (
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle className=" text-lg">To continue please confirm your email</AlertDialogTitle>
					<AlertDialogDescription className=" text-md">
						Go to your email and finish registrations. If you didn't receive an email, click the button below to
						resend it. It may take a minute to arrive.
					</AlertDialogDescription>
					<Button variant="outline" disabled={isLoading} onClick={handleResendConfirmation}>
						Resend email {isLoading && <span>Loading...</span>}
					</Button>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogAction>Close</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default AlertDialogComponent;
