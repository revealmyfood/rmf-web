import React from 'react';
import {
	Grid,
	Card,
	Title,
	List,
	ThemeIcon,
	Text,
	Group,
	Badge,
	Chip,
	Accordion,
	Loader,
	Container,
	Center
} from '@mantine/core';
import { IconCircle, IconCell, IconApple } from '@tabler/icons';
import { DishInfo } from '../interfaces/dishesInterface';
import { useQuery } from '@tanstack/react-query';
import { createFirebaseApp, createFirebaseDb } from '../firebase/clientApp';
import {
	ref as dbRef,
	equalTo,
	get,
	getDatabase,
	orderByChild,
	query
} from 'firebase/database';
import { useRouter } from 'next/router';

const IngredientAccordion = ({
	dishId,
	hasIngredients
}: {
	dishId: string;
	hasIngredients: boolean;
}) => {
	const {
		query: { restaurant }
	} = useRouter();

	const [enableRequest, setEnableRequest] = React.useState(false);
	const { data: dishInfo = {}, isLoading } = useQuery(
		['dishInfo', restaurant, dishId],
		async () => {
			const app = createFirebaseApp();
			const ref = getDatabase(app);
			const menu = await get(
				dbRef(
					ref,
					`/multiRestaurantUniverse/reveal_restaurant_partners/menuLists/${restaurant}/dishItems/menu/${dishId}`
				)
			);
			if (menu.exists()) {
				return menu.val();
			}
		},
		{ enabled: enableRequest, suspense: false }
	);

	return (
		<>
			<Accordion.Item onClick={() => setEnableRequest(true)} value='ingredients'>
				<Accordion.Control disabled={!hasIngredients}>Show Ingredients</Accordion.Control>
				<Accordion.Panel>
					{isLoading ? (
						<Center m={'md'}>
							<Loader />
						</Center>
					) : (
						<Card.Section withBorder inheritPadding py='xs'>
							<Grid grow>
								<Grid.Col span={12}>
									<List
										spacing='xs'
										size='md'
										center
										icon={
											<ThemeIcon variant='filled' color='green' size={24} radius='xl'>
												<IconApple size={16} />
											</ThemeIcon>
										}
									>
										{Object.entries(dishInfo)
											.filter(([key]) => key.match(/ingredient_/))
											.map(([key, ingredient]) => (
												<List.Item key={key}>{ingredient as string}</List.Item>
											))}
									</List>
								</Grid.Col>
							</Grid>
						</Card.Section>
					)}
				</Accordion.Panel>
			</Accordion.Item>
			{/* Nutrients */}
			<Accordion.Item onClick={() => setEnableRequest(true)} value='nutrients'>
				<Accordion.Control>Show Nutrients</Accordion.Control>
				<Accordion.Panel>
					{isLoading ? (
						<Center m={'md'}>
							<Loader />
						</Center>
					) : (
						<List
							spacing='xs'
							size='md'
							center
							icon={
								<ThemeIcon variant='filled' color='green' size={24} radius='xl'>
									<IconCell size={16} />
								</ThemeIcon>
							}
						>
							<List.Item>
								<Text>Energy: {dishInfo.energy}</Text>
							</List.Item>
							<List.Item>
								<Text>Fat: {dishInfo.fat}</Text>
							</List.Item>
							<List.Item>
								<Text>Fibre: {dishInfo.fibre}</Text>
							</List.Item>
							<List.Item>
								<Text>Proteins: {dishInfo.protein}</Text>
							</List.Item>
							<List.Item>
								<Text>Sugar: {dishInfo.sugar}</Text>
							</List.Item>
						</List>
					)}
				</Accordion.Panel>
			</Accordion.Item>
		</>
	);
};

interface Props {
	dish: DishInfo;
	lifestyle: Array<string>;
	healthTags: Array<string>;
	hasIngredients: boolean;
	allergens: Array<string>;
}

const DishCard = ({ dish, allergens, healthTags, hasIngredients, lifestyle }: Props) => {
	return (
		<>
			<Grid.Col span={12}>
				<Card withBorder shadow='sm' radius='md' p='md'>
					<Card.Section inheritPadding p='md'>
						<Group position='apart'>
							<Title order={5}>{dish.dishName}</Title>
							<Badge variant='filled' size='xl' radius='md'>
								{dish.price} £
							</Badge>
						</Group>
					</Card.Section>

					<Card.Section withBorder inheritPadding py='xs'>
						<Text weight={400}>{dish.description}</Text>
					</Card.Section>

					{/* Lifestyles */}
					{lifestyle && (
						<Card.Section inheritPadding py='xs' px='xs'>
							<Group position='left' spacing={'sm'}>
								{lifestyle.map(l => (
									<Badge
										size='lg'
										key={l}
										variant='gradient'
										gradient={{ from: 'teal', to: 'lime', deg: 105 }}
									>
										{l}
									</Badge>
								))}
							</Group>
						</Card.Section>
					)}

					{/* Health Tags */}
					{healthTags && (
						<Card.Section withBorder inheritPadding py='xs'>
							<Group position='left' spacing={'sm'}>
								{healthTags.map(healthTag => (
									<Chip checked size='sm' variant='filled' color='green' key={healthTag}>
										{healthTag}
									</Chip>
								))}
							</Group>
						</Card.Section>
					)}

					<Card.Section inheritPadding>
						{/* <Text weight={500} size="md">
              More information
            </Text> */}
						<Accordion
							chevronPosition='left'
							defaultValue='customization'
							variant='contained'
							py={'sm'}
						>
							{/* Ingredients */}
							<IngredientAccordion hasIngredients={hasIngredients} dishId={dish.id} />
						</Accordion>
					</Card.Section>

					{/* Allergens */}
					<Card.Section withBorder inheritPadding py='xs'>
						{allergens.length ? (
							<List
								spacing='xs'
								size='md'
								center
								icon={
									<ThemeIcon variant='light' color='red' size={24} radius='xl'>
										<IconCircle size={16} />
									</ThemeIcon>
								}
							>
								{allergens.map(allergen => (
									<List.Item key={allergen}>
										<Text transform={'capitalize'}>{allergen}</Text>
									</List.Item>
								))}
							</List>
						) : (
							<List
								spacing='xs'
								size='md'
								center
								icon={
									<ThemeIcon variant='filled' color='green' size={24} radius='xl'>
										<IconCircle size={16} />
									</ThemeIcon>
								}
							>
								<List.Item>No allergens</List.Item>
							</List>
						)}
					</Card.Section>
				</Card>
			</Grid.Col>
		</>
	);
};

export default DishCard;
