import { createClient } from '@/lib/supabase/server';

export default async function Home() {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.getUser();

	console.log(data, error);

	return <>Hello</>;
}
