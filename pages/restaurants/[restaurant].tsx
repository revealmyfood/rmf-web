import {
	Box,
	CloseButton,
	Grid,
	MultiSelect,
	MultiSelectValueProps,
	SelectItemProps,
	Text,
	Image,
	Accordion,
	Chip,
	createStyles
} from '@mantine/core';
import { get, ref as dbRef, getDatabase } from 'firebase/database';
import DishCard from '../../components/DishCard';
import { createFirebaseApp } from '../../firebase/clientApp';
import { Dish, DishInfo, RestaurantData } from '../../interfaces/dishesInterface';
import SEO from '../../components/SEO';
import { NextApiRequest, NextApiResponse } from 'next';
import React, { forwardRef, memo, useEffect, useMemo, useState } from 'react';
import nookies from 'nookies';
import { firebaseAdmin } from '../../firebase/firebaseAdmin';
// import Image from 'next/image';
// import { getDownloadURL, getStorage, ref as storageRef } from '@firebase/storage';
type Props = {
	data: {
		authenticated: boolean;
		title: string;
		description: string;
		name: string;
		dishesData: DishInfo[];
		allergens: { [key: string]: string }[];
		lifestyles: string[];
		healthTags: string[];
	};
};

const useStyles = createStyles((theme, _params) => ({
	input: {
		display: 'none'
	},
	label: {
		display: 'flex'
	}
}));

const Restaurant = ({ data }: Props) => {
	const {
		title,
		description,
		name,
		dishesData,
		allergens,
		lifestyles,
		authenticated,
		healthTags
	} = data;
	const [dishes, setDishes] = useState<DishInfo[]>(dishesData);
	const [allergensFilter, setAllergensFilter] = useState<string[]>([]);
	const [healthTagsFilter, setHealthTagsFilter] = useState<string[]>([]);
	const [lifestylesFilter, setLifestyleFilter] = useState<string[]>([]);
	const { classes } = useStyles();

	useEffect(() => {
		let filteredDishes = dishesData;
		if (allergensFilter.length > 0) {
			filteredDishes = dishesData.filter(
				dish => !dish.allergens.some(allergen => allergensFilter.includes(allergen.name))
			);
		}

		if (healthTagsFilter.length > 0) {
			filteredDishes = dishesData.filter(dish =>
				dish.healthTags.some(healthTag => healthTagsFilter.includes(healthTag))
			);
		}
		if (lifestylesFilter.length > 0) {
			filteredDishes = dishesData.filter(dish =>
				dish.lifestyle.some(lifestyle => lifestylesFilter.includes(lifestyle))
			);
		}

		setDishes(filteredDishes);
	}, [allergensFilter, dishesData, healthTagsFilter, lifestylesFilter]);

	if (typeof window !== 'undefined' && !authenticated) {
		const inIframe = window === window.top;
		if (inIframe && location.hostname !== 'localhost') {
			window.location.href = '/404';
			return null;
		}
	}

	return (
		<>
			<SEO title={title} description={description} />
			<Grid grow>
				<Grid.Col span={12}>
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
				</Grid.Col>
				<Grid.Col sm={6} md={4}>
					<Accordion
						chevronPosition='left'
						defaultValue='customization'
						variant='default'
					>
						<Accordion.Item value='nutrients'>
							<Accordion.Control>Allergens</Accordion.Control>
							<Accordion.Panel>
								<Chip.Group
									value={allergensFilter}
									onChange={setAllergensFilter}
									position='left'
									multiple
								>
									{Object.entries(allergens)
										.sort()
										.map(([all, image]) => (
											<Chip classNames={classes} variant={'filled'} value={all} key={all}>
												<Box sx={{ display: 'flex', alignItems: 'center' }}>
													<Box mr={10} sx={{ display: 'flex', alignItems: 'center' }}>
														<Image alt={all} src={'/' + image} width={20} height={20} />
													</Box>
													<Text>{all}</Text>
												</Box>
											</Chip>
										))}
								</Chip.Group>
							</Accordion.Panel>
						</Accordion.Item>
					</Accordion>
				</Grid.Col>
				{healthTags.length > 0 && (
					<Grid.Col sm={6} md={4}>
						<Accordion
							chevronPosition='left'
							defaultValue='customization'
							variant='default'
						>
							<Accordion.Item value='nutrients'>
								<Accordion.Control>Health Claims</Accordion.Control>
								<Accordion.Panel>
									<Chip.Group
										value={healthTagsFilter}
										onChange={value => setHealthTagsFilter(value.slice(-2))}
										position='left'
										multiple
									>
										{healthTags.sort().map(h => (
											<Chip classNames={classes} variant={'filled'} value={h} key={h}>
												<Text>{h}</Text>
											</Chip>
										))}
									</Chip.Group>
								</Accordion.Panel>
							</Accordion.Item>
						</Accordion>
					</Grid.Col>
				)}
				{lifestyles.length > 0 && (
					<Grid.Col sm={6} md={4}>
						<MultiSelect
							mb={'md'}
							data={lifestyles.sort().map(all => ({
								label: all.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase()),
								value: all
							}))}
							onChange={setLifestyleFilter}
							disabled={lifestyles.length === 0}
							label='Lifestyle'
							placeholder='Select lifestyles from the list'
							clearable
						/>
					</Grid.Col>
				)}
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
  default-src 'self' 'unsafe-inline' ${src} *.googleapis.com *.google-analytics.com *.vercel-insights.com;
  img-src 'self' data:;
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
	const healthTags = new Set<string>();

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

		let authenticated;
		try {
			const cookies = nookies.get(ctx);
			await firebaseAdmin.auth().verifyIdToken(cookies.token);
			authenticated = true;
		} catch (error) {
			authenticated = false;
		}

		serverData = {
			authenticated,
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
										curr in allergens
											? [...prev.allergens, { name: curr, image: allergens[curr] }]
											: prev.allergens
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
				// @ts-ignore
				dishData.healthTags.forEach(healthTags.add, healthTags);
				return dishData;
			})
		};
	}
	return {
		props: {
			data: {
				...serverData,
				lifestyles: [...lifestyles],
				healthTags: [...healthTags]
			}
		}
	};
}

export default Restaurant;
