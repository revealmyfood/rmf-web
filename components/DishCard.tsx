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
	Center
} from '@mantine/core';
import { IconCircle, IconCell, IconApple } from '@tabler/icons';
import { DishInfo } from '../interfaces/dishesInterface';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import axios from 'axios';
import Image from 'next/image';

const IngredientAccordion = ({
	allergens,
	dishId,
	hasIngredients
}: {
	allergens: { name: string; image: string }[];
	dishId: string;
	hasIngredients: boolean;
}) => {
	const {
		query: { restaurant, u }
	} = useRouter();

	const [enableRequest, setEnableRequest] = React.useState(false);
	const { data: dishInfo = {}, isLoading } = useQuery(
		['dishInfo', restaurant, dishId],
		async () =>
			axios.get(`/api/dishes/${restaurant}/${dishId}?u=${u}`).then(res => res.data),
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
									<Group position='left' spacing={'sm'} my={'sm'}>
										{allergens.map(a => (
											<Badge
												size='lg'
												key={a.name}
												variant='outline'
												gradient={{ from: 'teal', to: 'lime', deg: 105 }}
											>
												<Center>
													<Image
														src={'/' + a.image}
														alt={a.name}
														width={20}
														height={20}
													/>
													<Text ml={'xs'}>{a.name}</Text>
												</Center>
											</Badge>
										))}
									</Group>
								</Grid.Col>
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
	allergens: Array<{ name: string; image: string }>;
}

const DishCard = ({ dish, allergens, healthTags, hasIngredients, lifestyle }: Props) => {
	return (
		<Card
			id={dish.id}
			data-toc={2}
			data-toc-title={dish.dishName}
			// withBorder
			shadow='sm'
			radius='md'
			// p='md'
			m='xs'
		>
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
					<IngredientAccordion
						allergens={allergens}
						hasIngredients={hasIngredients}
						dishId={dish.id}
					/>
				</Accordion>
			</Card.Section>
		</Card>
	);
};

export default DishCard;
