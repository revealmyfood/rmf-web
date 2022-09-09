// @ts-nocheck
import {Accordion, Anchor, Breadcrumbs, Grid, Image, Text} from "@mantine/core";
import { get, child } from "firebase/database";
// import { GetStaticPaths } from "next";
import Link from "next/link";
import DishCard from "../../components/DishCard";
import { createFirebaseApp, createFirebaseDb } from "../../firebase/clientApp";
import { Dish, RestaurantData } from "../../interfaces/dishesInterface";
type Props = {
  data: RestaurantData;
};

const Restaurant = ({ data }: Props) => {
  const restaurantData = data.dishItems.menu;
  const dishesData: Dish[] = Object.values(restaurantData);

  const hasLifestyle = dishesData.map((d, i) =>
    Object.keys(d).filter((key) => key.match(/lifestyle/))
  );
  const hasIngredients = dishesData.map((d, i) =>
    Object.keys(d).filter((key) => key.match(/ingredient/))
  );
  const hasHealthTags = dishesData.map((d, i) =>
    Object.keys(d).filter((key) => key.match(/health/))
  );
  const hasAllergens = dishesData.map((d, i) =>
    Object.keys(d).filter((key) => key.match(/allergen/))
  );
  return (
    <Grid grow>
      <Grid.Col span={12}>
        <Breadcrumbs>
          <Link href="/restaurants" passHref>
            <Anchor component="a">Restaurants</Anchor>
          </Link>
        </Breadcrumbs>
      </Grid.Col>

      <Text
        px="sm"
        py="lg"
        variant="gradient"
        size={40}
        weight={700}
        gradient={{ from: "teal", to: "lime", deg: 105 }}
      >
        {data.name}
      </Text>

      {dishesData.map((dish: Dish, index: number) => (
        <DishCard
          key={index}
          dish={dish}
          hasAllergens={hasAllergens[index]}
          hasIngredients={hasIngredients[index]}
          hasHealthTags={hasHealthTags[index]}
          hasLifestyle={hasLifestyle[index]}
        />
      ))}

      <Accordion style={{ width: "100%" }} variant="filled" radius={"md"}>
        <Accordion.Item value="rawData">
          <Accordion.Control>Show Raw Data</Accordion.Control>
          <Accordion.Panel>
            <pre
              style={{
                padding: "1rem",
                overflow: "auto",
              }}
            >
              {JSON.stringify(dishesData, null, 2)}
            </pre>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Grid>
  );
};

// export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
//   return {
//     paths: [], //indicates that no page needs be created at build time
//     fallback: "blocking", //indicates the type of fallback
//   };
// };

export async function getServerSideProps({query}) {
  const app = createFirebaseApp();
  const ref = createFirebaseDb(app);

  let data: RestaurantData = null;

  const restaurantsData = await get(
    child(ref, `/multiRestaurantUniverse/reveal_restaurant_partners/menuLists/${query.restaurant}`)
  );

  if (restaurantsData.exists()) {
    data = restaurantsData.val() as RestaurantData;
    // const storage = getStorage(app);
    // const starsRef = storageRef(storage, data.logoPath);
    // data.url = await getDownloadURL(starsRef);
  }

  return {
    props: {
      data ,
    },
  };
}

export default Restaurant;
