// @ts-nocheck

import React from 'react';
import { Button, Card, Grid, Group, Text } from '@mantine/core';
import { child, get } from 'firebase/database';
import { createFirebaseApp, createFirebaseDb } from '../../firebase/clientApp';
import Link from 'next/link';
import { Dish } from '../../interfaces/dishesInterface';
import { Restaurant } from '../../interfaces/restaurantsInterface';
import { GetServerSidePropsContext } from 'next';
import useFirebaseAuth from '../../hook/useFirebaseAuth';
import nookies from 'nookies';
import { firebaseAdmin } from '../../firebase/firebaseAdmin';

type Props = {
	restaurants: Restaurant[];
	dishes: Dish[];
};

export default function List({ restaurants }: Props) {
	const { signOut } = useFirebaseAuth();
	return (
		<>
			<Group position={'right'} m={'lg'}>
				<Button onClick={signOut}>Sign out</Button>
			</Group>
			<Grid grow p='md'>
				{restaurants.map((restaurant: Restaurant, index: number) => (
					<Grid.Col md={6} xs={12} key={index}>
						<Link
							href={{
								pathname: '/restaurants/[restaurant]',
								query: {
									restaurant: restaurant.key,
									u: restaurant.accessKey
								}
							}}
						>
							<Card withBorder shadow='sm' radius='md'>
								<Card.Section withBorder inheritPadding py='xs'>
									<Text weight={500}>{restaurant.name.toString()}</Text>
								</Card.Section>
								<Button variant='light' fullWidth mt='md' radius='md'>
									Menu
								</Button>
							</Card>
						</Link>
					</Grid.Col>
				))}
			</Grid>
		</>
	);
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	try {
		const cookies = nookies.get(ctx);
		await firebaseAdmin.auth().verifyIdToken(cookies.token);
	} catch (error) {
		// either the `token` cookie didn't exist
		// or token verification failed
		// either way: redirect to the login page
		return {
			redirect: {
				destination: '/',
				permanent: false
			}
		};
	}

	const app = createFirebaseApp();
	const ref = createFirebaseDb(app);
	const restaurantsData = await get(
		child(ref, '/multiRestaurantUniverse/reveal_restaurant_partners/menuLists')
	);
	let restaurants: { key: string; name: string }[] = [];

	if (restaurantsData.exists()) {
		let data = restaurantsData.val();
		restaurants = Object.entries(data).map(([k, d]) => ({
			key: k,
			name: d.name,
			accessKey: d.accessKey || ''
		}));
	}

	return {
		props: {
			restaurants
		}
	};
}
