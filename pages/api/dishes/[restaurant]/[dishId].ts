import { NextApiRequest, NextApiResponse } from 'next';
import { get, getDatabase, query } from 'firebase/database';
import { ref as dbRef } from '@firebase/database';
import { DishInfo } from '../../../../interfaces/dishesInterface';
import { createFirebaseApp } from '../../../../firebase/clientApp';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<DishInfo | { message: string }>
) {
	const { restaurant, dishId, u } = req.query;
	const app = createFirebaseApp();
	const ref = getDatabase(app);

	const queryRef = await get(
		query(
			dbRef(
				ref,
				`/multiRestaurantUniverse/reveal_restaurant_partners/menuLists/${restaurant}`
			)
		)
	);
	if (queryRef.exists()) {
		const menu = queryRef.val();
		const dish = menu.dishItems.menu[dishId as string];
		if (menu.accessKey === u && dish) {
			res.status(200).json(dish);
			return;
		}
	}
	res.status(404).json({ message: 'Dish not found' });
}
