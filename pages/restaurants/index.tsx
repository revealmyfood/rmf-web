// @ts-nocheck

import React from "react";
import {Button, Card, Grid, Text} from "@mantine/core";
import {child, get} from "firebase/database";
import {createFirebaseApp, createFirebaseDb} from "../../firebase/clientApp";
import Link from "next/link";
import {Dish} from "../../interfaces/dishesInterface";
import {Restaurant} from "../../interfaces/restaurantsInterface";
import slug from "slug";

type Props = {
    restaurants: Restaurant[];
    dishes: Dish[];
};

export default function List({restaurants}: Props) {
    return (
        <Grid grow>
            {restaurants.map((restaurant: Restaurant, index: number) => (
                <Grid.Col md={6} xs={12} key={index}>
                    <Link href="/restaurants/[restaurant]" as={`/restaurants/${restaurant.key}`}>
                        <Card withBorder shadow="sm" radius="md">
                            <Card.Section withBorder inheritPadding py="xs">
                                <Text weight={500}>{restaurant.name.toString()}</Text>
                            </Card.Section>
                            <Button variant="light" fullWidth mt="md" radius="md">
                                Menu
                            </Button>
                        </Card>
                    </Link>
                </Grid.Col>
            ))}
        </Grid>
    );
}

export async function getStaticProps() {
    const app = createFirebaseApp();
    const ref = createFirebaseDb(app);

    const restaurantsData = await get(
        child(ref, "/multiRestaurantUniverse/reveal_restaurant_partners/menuLists")
    );
    let restaurants: { key: string, name: string }[] = [];

    if (restaurantsData.exists()) {
        let data = restaurantsData.val();
        restaurants = Object.entries(data)
            .map(([k,d]) => ({
                key: k,
                name: d.name
            }));
    }

    return {
        props: {
            restaurants,
        },
    };
}
