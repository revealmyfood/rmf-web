import { Container, Grid, MultiSelect, Text } from '@mantine/core';
import {
	get,
	child,
	query as dbQuery,
	equalTo,
	orderByChild,
	ref as dbRef,
	getDatabase,
	startAt,
	orderByValue
} from 'firebase/database';
import DishCard from '../../components/DishCard';
import { createFirebaseApp } from '../../firebase/clientApp';
import { Dish, DishInfo, RestaurantData } from '../../interfaces/dishesInterface';
import SEO from '../../components/SEO';
import { NextApiRequest, NextApiResponse } from 'next';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/router';
import nookies from 'nookies';
import { firebaseAdmin } from '../../firebase/firebaseAdmin';
import useIsomorphicLayoutEffect from '../../hook/useIsomorphicLayoutEffect';
import useFirebaseAuth from '../../hook/useFirebaseAuth';
// import { getDownloadURL, getStorage, ref as storageRef } from '@firebase/storage';
type Props = {
	data: {
		title: string;
		description: string;
		name: string;
		dishesData: DishInfo[];
		allergens: string[];
		lifestyles: string[];
	};
};

const Restaurant = ({ data }: Props) => {
	const { title, description, name, dishesData, allergens, lifestyles } = data;
	const [dishes, setDishes] = useState<DishInfo[]>(dishesData);
	const [allergensFilter, setAllergensFilter] = useState<string[]>([]);
	const [lifestylesFilter, setLifestyleFilter] = useState<string[]>([]);
	const { authState } = useFirebaseAuth();

	useIsomorphicLayoutEffect(() => {
		const inIframe = window === window.top;
		if (inIframe && location.hostname !== 'localhost' && !authState.authUser) {
			window.location.href = '/404';
		}
	}, [authState]);

	useEffect(() => {
		let filteredDishes = dishesData;
		if (allergensFilter.length > 0) {
			filteredDishes = dishesData.filter(dish =>
				dish.allergens.some(allergen => allergensFilter.includes(allergen))
			);
		}
		if (lifestylesFilter.length > 0) {
			filteredDishes = dishesData.filter(dish =>
				dish.lifestyle.some(lifestyle => lifestylesFilter.includes(lifestyle))
			);
		}

		setDishes(filteredDishes);
	}, [allergensFilter, dishesData, lifestylesFilter]);

	return (
		<>
			<SEO title={title} description={description} />
			<Grid grow>
				<Text
					px='sm'
					py='lg'
					variant='gradient'
					size={40}
					weight={700}
					gradient={{ from: 'teal', to: 'lime', deg: 105 }}
				>
					{name}
				</Text>
				<Grid.Col>
					<MultiSelect
						data={Object.keys(allergens)
							.sort()
							.map(all => ({
								label: all.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase()),
								value: all
							}))}
						onChange={setAllergensFilter}
						label='Filter by allergens'
						placeholder='Select allergens from the list'
						clearable
					/>
				</Grid.Col>
				<Grid.Col>
					<MultiSelect
						mb={'md'}
						data={lifestyles.sort().map(all => ({
							label: all.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase()),
							value: all
						}))}
						onChange={setLifestyleFilter}
						disabled={lifestyles.length === 0}
						label='Filter by lifestyle'
						placeholder='Select lifestyles from the list'
						clearable
					/>
				</Grid.Col>
				{dishes.map(dish => (
					<DishCard
						key={dish.id}
						dish={dish}
						allergens={dish.allergens}
						hasIngredients={dish.hasIngredients}
						healthTags={dish.healthTags}
						lifestyle={dish.lifestyle}
					/>
				))}
			</Grid>
		</>
	);
};

const ContentSecurityPolicy = (src: string) => `
  default-src 'self' 'unsafe-inline' ${src} *.googleapis.com *.google-analytics.com;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' *.google-analytics.com *.googletagmanager.com ${src};
  font-src 'self' ${src};;  
`;

export async function getServerSideProps(ctx: {
	req: NextApiRequest;
	res: NextApiResponse;
	query: { restaurant: string; u: string };
}) {
	const { res, query } = ctx;
	// const storage = getStorage(app);
	const app = createFirebaseApp();
	const ref = getDatabase(app);

	const restaurantsDataProm = get(
		dbRef(
			ref,
			`/multiRestaurantUniverse/reveal_restaurant_partners/menuLists/${query.restaurant}`
		)
	);

	const allergensDataProm = get(dbRef(ref, '/allergenAssetPath'));
	const [restaurantsData, allergensData] = await Promise.all([
		restaurantsDataProm,
		allergensDataProm
		// .then(snapshot => snapshot.val())
		// .then(allergensData =>
		// 	Promise.all(
		// 		Object.entries(allergensData).map(([k, v]) =>
		// 			(v && typeof v === 'string'
		// 				? getDownloadURL(storageRef(storage, v))
		// 				: Promise.resolve(null)
		// 			).then(url => ({ [k]: url }))
		// 		)
		// 	)
		// )
		// .then(allergensData => Object.assign({}, ...allergensData))
	]);

	let serverData = {};
	const lifestyles = new Set<string>();

	if (restaurantsData.exists()) {
		const data = restaurantsData.val() as RestaurantData;
		const allergens = allergensData.val();

		if ((data.accessKey || '') !== query.u) {
			return {
				redirect: {
					destination: '/404',
					permanent: false
				}
			};
		}
		res.setHeader('Access-Control-Allow-Origin', data.origin || '');
		res.setHeader(
			'Content-Security-Policy',
			`${ContentSecurityPolicy(data.origin || '')} 
			frame-ancestors 'self' ${data.origin || ''}`
				.replace(/\s{2,}/g, ' ')
				.trim()
		);
		res.setHeader('X-Frame-Options', `ALLOW-FROM ${data.origin || ''}`);
		// res.removeHeader('X-Frame-Options');

		const restaurantData = data.dishItems.menu;
		const dishesData: [string, Dish][] = Object.entries(restaurantData);

		serverData = {
			title: `Menu ${data.name}`,
			description: data.metaDescription || '',
			allergens,
			name: data.name,
			dishesData: dishesData.map(([key, dish]) => {
				const dishData = {
					id: key,
					dishName: dish.dishName,
					description: dish.description,
					price: dish.price,
					...Object.keys(dish)
						.filter(key => key.match(/lifestyle|ingredient|health/) || key in allergens)
						.reduce(
							(prev, curr) => {
								return {
									...prev,
									lifestyle: curr.match(/lifestyle/)
										? [...prev.lifestyle, dish[curr]]
										: prev.lifestyle,
									healthTags: curr.match(/health/)
										? [...prev.healthTags, dish[curr]]
										: prev.healthTags,
									hasIngredients:
										prev.hasIngredients || Boolean(curr.match(/ingredient/)),
									allergens:
										curr in allergens ? [...prev.allergens, curr] : prev.allergens
								};
							},
							{
								lifestyle: [],
								healthTags: [],
								hasIngredients: false,
								allergens: []
							} as Record<string, any>
						)
				};
				// @ts-ignore
				dishData.lifestyle.forEach(lifestyles.add, lifestyles);
				return dishData;
			})
		};
	}
	return {
		props: {
			data: {
				...serverData,
				lifestyles: [...lifestyles]
			}
		}
	};
}

export default Restaurant;
