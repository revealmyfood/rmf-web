import React from "react";
import { Button, Card, Grid, Text } from "@mantine/core";
import { child, get } from "firebase/database";
import { createFirebaseApp, createFirebaseDb } from "../../firebase/clientApp";
import Link from "next/link";
import { Dish } from "../../interfaces/dishesInterface";
import { Restaurant } from "../../interfaces/restaurantsInterface";

type Props = {
  restaurants: Restaurant[];
  dishes: Dish[];
};

export default function List({ restaurants, dishes }: Props) {
  return (
    <Grid grow>
      {restaurants.map((restaurant: Restaurant, index: number) => (
        <Grid.Col span={6} key={index}>
          <Link href="/restaurants/[restaurant]" as={`/restaurants/${index}`}>
            <Card withBorder shadow="sm" radius="md">
              <Card.Section withBorder inheritPadding py="xs">
                <Text weight={500}>{restaurant.toString()}</Text>
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

  const restaurantsData = await get(child(ref, "/menuLists"));
  let restaurants: string[] = [];
  let dishes: string[] | any = [];

  if (restaurantsData.exists()) {
    let data = restaurantsData.val();
    restaurants = Object.keys(data).map((r) =>
      r.split("_").join(" ").toLowerCase()
    );
    dishes = Object.values(data);
  }

  return {
    props: {
      restaurants,
      dishes,
    },
  };
}
