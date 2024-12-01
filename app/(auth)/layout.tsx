import { Card, CardContent } from '@/components/ui/card';
import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className=" flex min-h-screen" suppressHydrationWarning>
			<section className=" hidden w-1/2 items-center justify-center bg-brand lg:flex xl:w-2/5">
				<div className="space-y-5 text-white">
					<h1 className="h1">Manage your files the best way</h1>
					<p className="body-1">This is a place where you can store all your documents.</p>
				</div>
			</section>
			<section className=" w-full flex justify-center xl:w-3/5 ">
				<Card className="w-[450px] m-auto px-4 py-2 ">{children}</Card>
			</section>
		</div>
	);
};

export default Layout;
