import {
	Box,
	CloseButton,
	Grid,
	MultiSelect,
	MultiSelectValueProps,
	SelectItemProps,
	Text,
	Image
} from '@mantine/core';
import { get, ref as dbRef, getDatabase } from 'firebase/database';
import DishCard from '../../components/DishCard';
import { createFirebaseApp } from '../../firebase/clientApp';
import { Dish, DishInfo, RestaurantData } from '../../interfaces/dishesInterface';
import SEO from '../../components/SEO';
import { NextApiRequest, NextApiResponse } from 'next';
import { forwardRef, memo, useEffect, useMemo, useState } from 'react';
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
	};
};

const Value = memo(
	({
		allergens,
		value,
		label,
		onRemove,
		classNames,
		...others
	}: MultiSelectValueProps & { value: string; allergens: { [key: string]: string } }) => {
		const allergen = useMemo(() => allergens[value], [value, allergens]);
		return (
			<div {...others}>
				<Box
					sx={theme => ({
						display: 'flex',
						cursor: 'default',
						alignItems: 'center',
						backgroundColor:
							theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
						border: `1px solid ${
							theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[4]
						}`,
						paddingLeft: 10,
						borderRadius: 4
					})}
				>
					<Box mr={10}>
						<Image alt={value} src={'/' + allergen} height={20} width={20} />
					</Box>
					<Box sx={{ lineHeight: 1, fontSize: 12 }}>{label}</Box>
					<CloseButton
						onMouseDown={onRemove}
						variant='transparent'
						size={22}
						iconSize={14}
						tabIndex={-1}
					/>
				</Box>
			</div>
		);
	},
	(prevProps, nextProps) =>
		prevProps.value === nextProps.value && prevProps.allergens === nextProps.allergens
);
Value.displayName = 'MultivalueItem';

const Item = memo(
	forwardRef<HTMLDivElement, SelectItemProps & { allergens: { [key: string]: string } }>(
		({ allergens, label, value, ...others }, ref) => {
			const allergen = useMemo(() => allergens[value as string], [allergens, value]);

			return (
				<div ref={ref} {...others}>
					<Box sx={{ display: 'flex', alignItems: 'center' }}>
						<Box mr={10} sx={{ display: 'flex', alignItems: 'center' }}>
							<Image alt={value} src={'/' + allergen} width={20} height={20} />
						</Box>
						<div>{label}</div>
					</Box>
				</div>
			);
		}
	),
	(prevProps, nextProps) =>
		prevProps.value === nextProps.value && prevProps.allergens === nextProps.allergens
);
Item.displayName = 'MultiSelectItem';

const Restaurant = ({ data }: Props) => {
	const { title, description, name, dishesData, allergens, lifestyles, authenticated } =
		data;
	const [dishes, setDishes] = useState<DishInfo[]>(dishesData);
	const [allergensFilter, setAllergensFilter] = useState<string[]>([]);
	const [lifestylesFilter, setLifestyleFilter] = useState<string[]>([]);

	useEffect(() => {
		let filteredDishes = dishesData;
		if (allergensFilter.length > 0) {
			filteredDishes = dishesData.filter(
				dish => !dish.allergens.some(allergen => allergensFilter.includes(allergen.name))
			);
		}
		if (lifestylesFilter.length > 0) {
			filteredDishes = dishesData.filter(dish =>
				dish.lifestyle.some(lifestyle => lifestylesFilter.includes(lifestyle))
			);
		}

		setDishes(filteredDishes);
	}, [allergensFilter, dishesData, lifestylesFilter]);

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
						itemComponent={props => <Item allergens={allergens} {...props} />}
						valueComponent={props => <Value {...props} allergens={allergens} />}
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
