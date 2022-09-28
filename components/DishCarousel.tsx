import { CarouselJsonLd, RecipeJsonLdProps } from 'next-seo';
import { DishInfo } from '../interfaces/dishesInterface';
import { CarouselJsonLdProps } from 'next-seo/lib/jsonld/carousel';

interface DishCarouselProps {
	restaurant: string;
	dishes: [string, DishInfo[]][];
}

const DishCarousel = ({ restaurant, dishes }: DishCarouselProps) => {
	return (
		<CarouselJsonLd
			ofType='recipe'
			data={dishes.flatMap(([type, dish]) =>
				dish.map(
					d =>
						({
							name: d.dishName,
							authorName: restaurant,
							// datePublished: d.updatedAt, TODO: add date
							description: d.description,
							keywords: [
								...d.healthTags,
								...d.lifestyle,
								...d.allergens.map(a => a.name)
							].join(','),
							category: type,
							ingredients: d.ingredients,
							instructions: [],
							// images: [d.image],TODO: add image
							images: ['/logo_rmf.png']
						} as RecipeJsonLdProps)
				)
			)}
		/>
	);
};

export default DishCarousel;
