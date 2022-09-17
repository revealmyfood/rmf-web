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
import { start } from 'repl';
// import { getDownloadURL, getStorage, ref as storageRef } from '@firebase/storage';
type Props = {
	data: {
		name: string;
		dishesData: DishInfo[];
	};
};

const Restaurant = ({ data }: Props) => {
	const { name, dishesData } = data;
	return (
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
	);
};

export async function getServerSideProps({
	query,
	req
}: {
	req: Request;
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

	console.log('ORIGIN', req.headers.origin);

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
		if (data.accessKey !== query.u) {
			return {
				redirect: {
					destination: '/404',
					permanent: false
				}
			};
		}
		const restaurantData = data.dishItems.menu;
		const dishesData: [string, Dish][] = Object.entries(restaurantData);

		serverData = {
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
