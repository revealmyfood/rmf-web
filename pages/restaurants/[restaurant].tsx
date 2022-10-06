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
	createStyles,
	Card,
	Badge,
	Group,
	Button,
	Modal,
	Tabs,
	ScrollArea,
	AppShell,
	Header,
	Indicator,
	Title
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
import { NextSeo } from 'next-seo';
import TableOfContents from '../../components/TableOfContent';
import DishCarousel from '../../components/DishCarousel';
import { IconBallTennis, IconFilter, IconLayoutList } from '@tabler/icons';
import { useMediaQuery } from '@mantine/hooks';
import MenuCategoriesTabs from '../../components/MenuCategoriesTabs';
// import Image from 'next/image';
// import { getDownloadURL, getStorage, ref as storageRef } from '@firebase/storage';
type Props = {
	data: {
		authenticated: boolean;
		title: string;
		description: string;
		name: string;
		dishesData: [string, DishInfo[]][];
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
	const [dishes, setDishes] = useState<[string, DishInfo[]][]>(dishesData);
	const [allergensFilter, setAllergensFilter] = useState<string[]>([]);
	const [healthTagsFilter, setHealthTagsFilter] = useState<string[]>([]);
	const [lifestylesFilter, setLifestyleFilter] = useState<string[]>([]);
	const [showFiltersModal, setShowFiltersModal] = useState(false);
	const isViewportDesktop = useMediaQuery('(min-width: 900px)');
	const { classes } = useStyles();

	useEffect(() => {
		let filteredDishes = dishesData;
		if (allergensFilter.length > 0) {
			filteredDishes = dishesData
				.map(
					([type, dish]) =>
						[
							type as string,
							dish.filter(
								d =>
									!d.allergens.some(allergen => allergensFilter.includes(allergen.name))
							)
						] as [string, DishInfo[]]
				)
				.filter(([_, dish]) => dish.length > 0);
		}

		if (healthTagsFilter.length > 0) {
			filteredDishes = dishesData
				.map(
					([type, dish]) =>
						[
							type,
							dish.filter(d =>
								d.healthTags.some(healthTag => healthTagsFilter.includes(healthTag))
							)
						] as [string, DishInfo[]]
				)
				.filter(([_, dish]) => dish.length > 0);
		}
		if (lifestylesFilter.length > 0) {
			filteredDishes = dishesData
				.map(
					([type, dish]) =>
						[
							type,
							dish.filter(d =>
								d.lifestyle.some(lifestyle => lifestylesFilter.includes(lifestyle))
							)
						] as [string, DishInfo[]]
				)
				.filter(([_, dish]) => dish.length > 0);
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
			<AppShell
				padding='md'
				header={
					<Header height={!isViewportDesktop ? 102 : 70} p='md'>
						{/* <Indicator inline label={3} size={16} color='green'> */}
						<Button
							variant='light'
							leftIcon={<IconFilter />}
							onClick={() => setShowFiltersModal(true)}
						>
							Filters
						</Button>
						{/* </Indicator> */}
						{!isViewportDesktop && (
							<ScrollArea style={{ width: 'calc(100vw - 32px)', height: 48 }}>
								<MenuCategoriesTabs items={dishes} />
							</ScrollArea>
						)}
					</Header>
				}
				styles={theme => ({
					main: {
						backgroundColor:
							theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]
					}
				})}
			>
				<DishCarousel dishes={dishesData} restaurant={name} />
				{/*<SEO title={title} description={description} />*/}
				<Grid grow>
					<Modal
						opened={showFiltersModal}
						onClose={() => setShowFiltersModal(false)}
						fullScreen
						padding='lg'
					>
						<Grid.Col>
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
													<Chip
														classNames={classes}
														variant={'filled'}
														value={all}
														key={all}
													>
														<Box sx={{ display: 'flex', alignItems: 'center' }}>
															<Box mr={10} sx={{ display: 'flex', alignItems: 'center' }}>
																<Image
																	alt={all}
																	src={'/' + image}
																	width={20}
																	height={20}
																/>
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
					</Modal>
				</Grid>
				<Grid grow>
					<Grid.Col sm={12} md={12}>
						<Grid>
							<Grid.Col sm={3} md={3}>
								{isViewportDesktop && <TableOfContents items={dishes} />}
							</Grid.Col>
							<Grid.Col sm={9} md={9}>
								{dishes.map(([type, dish]) => (
									// <Card
									// 	key={type}
									// 	id={type
									// 		.replace(/\s/g, '-')
									// 		.replace(/&/g, '-')
									// 		.replace(/>/g, '-')
									// 		.replace(/</g, '-')
									// 		.replace(/"/g, '-')}
									// 	data-toc={1}
									// 	data-toc-title={type.replace(/\b(\w)/g, s => s.toUpperCase())}
									// >
									// 	<Card.Section>
									// 		<Group mt={'xs'} ml={'xs'}>
									// 			{/* <Badge radius={'sm'} size={'xl'} variant={'outline'}> */}
									// 			{type.replace(/\b(\w)/g, s => s.toUpperCase())}
									// 			{/* </Badge> */}
									// 		</Group>
									// 	</Card.Section>
									// 	<Card.Section inheritPadding p='0'>
									// 		{dish.map(dish => (
									// 			<DishCard
									// 				key={dish.id}
									// 				dish={dish}
									// 				allergens={dish.allergens}
									// 				hasIngredients={dish.hasIngredients}
									// 				healthTags={dish.healthTags}
									// 				lifestyle={dish.lifestyle}
									// 			/>
									// 		))}
									// 	</Card.Section>
									// </Card>
									<div key={type}>
										<Title
											order={3}
											pt='md'
											px='md'
											id={type
												.replace(/\s/g, '-')
												.replace(/&/g, '-')
												.replace(/>/g, '-')
												.replace(/</g, '-')
												.replace(/"/g, '-')}
											data-toc={1}
											data-toc-title={type.replace(/\b(\w)/g, s => s.toUpperCase())}
										>
											{type.replace(/\b(\w)/g, s => s.toUpperCase())}
										</Title>
										{dish.map(dish => (
											<DishCard
												key={dish.id}
												dish={dish}
												allergens={dish.allergens}
												hasIngredients={dish.hasIngredients}
												healthTags={dish.healthTags}
												lifestyle={dish.lifestyle}
											/>
										))}
										<br />
									</div>
								))}
							</Grid.Col>
						</Grid>
					</Grid.Col>
					<Grid.Col sm={12} md={12}>
						<Text>RevealMyFood.com</Text>
					</Grid.Col>
				</Grid>
			</AppShell>
			<NextSeo
				title={title}
				description={description}
				additionalMetaTags={[
					{
						name: '',
						content: ''
					}
				]}
			/>
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
		const collator = new Intl.Collator([], { numeric: true });

		serverData = {
			authenticated,
			title: `Menu ${data.name}`,
			description: data.metaDescription || '',
			allergens,
			name: data.name,
			dishesData: [
				...dishesData
					.sort(([k1], [k2]) => collator.compare(k1, k2))
					.map(([key, dish]) => {
						const dishData = {
							id: key,
							dishName: dish.dishName,
							description: dish.description,
							price: dish.price ? Number(dish.price) : 0,
							category: dish.category_1?.toLowerCase() || 'no category',
							...(Object.keys(dish)
								.filter(
									key => key.match(/lifestyle|ingredient|health/) || key in allergens
								)
								.reduce(
									(prev, curr) => {
										return {
											...prev,
											lifestyle: curr.match(/lifestyle/)
												? [...prev.lifestyle, dish[curr] as string]
												: prev.lifestyle,
											healthTags: curr.match(/health/)
												? [...prev.healthTags, dish[curr] as string]
												: prev.healthTags,
											ingredients: curr.match(/ingredient/)
												? [...prev.ingredients, dish[curr] as string]
												: prev.ingredients,
											allergens:
												curr in allergens
													? [...prev.allergens, { name: curr, image: allergens[curr] }]
													: prev.allergens
										};
									},
									{
										lifestyle: [],
										healthTags: [],
										ingredients: [],
										allergens: []
									} as Pick<
										DishInfo,
										'lifestyle' | 'healthTags' | 'ingredients' | 'allergens'
									>
								) as Pick<
								DishInfo,
								'lifestyle' | 'healthTags' | 'ingredients' | 'allergens'
							>)
						} as DishInfo & { category: string };
						dishData.hasIngredients = dishData.ingredients.length > 0;
						// @ts-ignore
						dishData.lifestyle.forEach(lifestyles.add, lifestyles);
						// @ts-ignore
						dishData.healthTags.forEach(healthTags.add, healthTags);
						return dishData;
					})
					.reduce(
						(result, dish) =>
							result.has(dish.category)
								? result.set(dish.category, [...result.get(dish.category), dish])
								: result.set(dish.category, [dish]),
						new Map()
					)
					.entries()
			]
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
