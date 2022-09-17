import { Grid, Text } from '@mantine/core';
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
import { useEffect } from 'react';
import { useRouter } from 'next/router';
// import { getDownloadURL, getStorage, ref as storageRef } from '@firebase/storage';
type Props = {
	data: {
		title: string;
		description: string;
		name: string;
		dishesData: DishInfo[];
	};
};

const Restaurant = ({ data }: Props) => {
	const { title, description, name, dishesData } = data;
	const router = useRouter();

	useEffect(() => {
		const inIframe = window === window.top;
		if (inIframe && location.hostname !== 'localhost') {
			router.push('/404');
		}
	}, [router]);

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

				{dishesData.map(dish => (
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
  default-src 'self' 'unsafe-inline' ${src};
  script-src 'self' 'unsafe-inline' 'unsafe-eval' *.google-analytics.com *.googletagmanager.com ${src};
  font-src 'self' ${src};;  
`;

export async function getServerSideProps({
	query,
	req,
	res
}: {
	req: NextApiRequest;
	res: NextApiResponse;
	query: { restaurant: string; u: string };
}) {
	// const storage = getStorage(app);
	const app = createFirebaseApp();
	const ref = getDatabase(app);
	const restaurantsDataProm = get(
		dbRef(
			ref,
			`/multiRestaurantUniverse/reveal_restaurant_partners/menuLists/${query.restaurant}`
		)
	);
	// res.setHeader('Access-Control-Allow-Origin', '*');
	//
	// res.setHeader(
	// 	'Access-Control-Allow-Headers',
	// 	'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	// );
	// if (req.method == 'OPTIONS') {
	// 	res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
	// }

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
	if (restaurantsData.exists()) {
		const data = restaurantsData.val() as RestaurantData;
		const allergens = allergensData.val();

		let isNotValid: boolean = false;

		// if (origin) { TODO - check origin because we can't receive it from <object> tag
		// 	const originUrl = new URL(origin);
		// 	if (originUrl.hostname !== 'localhost' && data.origin !== originUrl.origin) {
		// 		isNotValid = true;
		// 	}
		// } else if (headers.host !== 'localhost:3000') {
		// 	isNotValid = true;
		// }
		if ((data.accessKey || '') !== query.u) {
			isNotValid = true;
		}
		if (isNotValid) {
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
			dishesData: dishesData.map(([key, dish]) => ({
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
								hasIngredients: prev.hasIngredients || Boolean(curr.match(/ingredient/)),
								allergens: curr in allergens ? [...prev.allergens, curr] : prev.allergens
							};
						},
						{
							lifestyle: [],
							healthTags: [],
							hasIngredients: false,
							allergens: []
						} as Record<string, any>
					)
			}))
		};
	}
	return {
		props: {
			data: serverData
		}
	};
}

export default Restaurant;
