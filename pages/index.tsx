import { ThemeContext } from '@emotion/react';
import {
	TextInput,
	PasswordInput,
	Checkbox,
	Anchor,
	Paper,
	Title,
	Text,
	Container,
	Group,
	Button,
	Center,
	useMantineTheme
} from '@mantine/core';
import type { NextPage } from 'next';
import Image from 'next/image';
import { MouseEvent, useEffect, useLayoutEffect, useState } from 'react';
import useAuth from '../hook/useFirebaseAuth';
import { useRouter } from 'next/router';
import useIsomorphicLayoutEffect from '../hook/useIsomorphicLayoutEffect';

const Home: NextPage = () => {
	const { authState, signInWithEmailAndPassword } = useAuth();
	const router = useRouter();
	const [pushLoading, setPushLoading] = useState(false);

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState(null);

	useIsomorphicLayoutEffect(() => {
		if (!authState.loading && authState.authUser) {
			setPushLoading(true);
			router.push('/restaurants');
		}
	}, [authState, router]);

	const onSubmit = (e: MouseEvent<any>) => {
		signInWithEmailAndPassword(email, password)
			.then(() => router.push('/restaurants'))
			.catch(error => setError(error.message));
		e.preventDefault();
	};

	if (authState.loading || pushLoading) {
		return <div>Loading...</div>;
	}
	return (
		<Container size={420} my={40}>
			<div style={{ position: 'relative', height: '50px' }}>
				<Image
					src='/logo_rmf.png'
					alt='Picture of the author'
					layout='fill'
					objectFit='contain'
				/>
			</div>
			<Title
				align='center'
				sx={theme => ({
					fontFamily: `Greycliff CF, ${theme.fontFamily}`,
					fontWeight: 900
				})}
			>
				<Text
					component='span'
					inherit
					variant='gradient'
					gradient={{ from: 'green', to: 'red' }}
				>
					Reveal My Food
				</Text>
			</Title>

			<Paper withBorder shadow='md' p={30} mt={30} radius='md'>
				{error && <Text color='red'>{error}</Text>}
				<TextInput
					label='Email'
					placeholder='you@mantine.dev'
					required
					value={email}
					onChange={event => setEmail(event.currentTarget.value)}
				/>
				<PasswordInput
					label='Password'
					placeholder='Your password'
					required
					mt='md'
					value={password}
					onChange={event => setPassword(event.currentTarget.value)}
				/>
				<Group position='apart' mt='md'>
					<Checkbox label='Remember me' />
					<Anchor<'a'> onClick={event => event.preventDefault()} href='#' size='sm'>
						Forgot password?
					</Anchor>
				</Group>
				<Button onClick={onSubmit} fullWidth mt='xl' component='a'>
					Sign in
				</Button>
			</Paper>
		</Container>
	);
};

export default Home;
