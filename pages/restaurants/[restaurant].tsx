// @ts-nocheck
import {
  Accordion,
  Anchor,
  Breadcrumbs,
  Button,
  Card,
  Grid,
  List,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { ListItem } from "@mantine/core/lib/List/ListItem/ListItem";
import {
  IconApple,
  IconCell,
  IconChefHat,
  IconCircle,
  IconCircleCheck,
  IconReceipt2,
  IconTag,
} from "@tabler/icons";
import { get, child } from "firebase/database";
import { GetStaticPaths } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { createFirebaseApp, createFirebaseDb } from "../../firebase/clientApp";
import { Dish, RestaurantData } from "../../interfaces/dishesInterface";

type Props = {
  data: RestaurantData;
};

const Restaurant = ({ data }: Props) => {
  const router = useRouter();
  const { restaurant } = router.query;

  const restaurantData = Object.values(data)[restaurant as any].dishItems.menu;
  const dishesData: Dish[] = Object.values(restaurantData);

  const lifestyles = [...Array(3).keys()].map((k) => `lifestyle_${k}`);
  const categories = [...Array(2).keys()].map((k) => `category_${k}`);
  const healtTags = [...Array(9).keys()].map((k) => `health_tags_${k}`);
  const ingredients = [...Array(31).keys()].map((k) => `ingredient_${k}`);
  const allergens = [...Array(14).keys()].map((k) => `allergens_${k}`);

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

      {dishesData.map((dish, index) => (
        <Grid.Col span={12} key={index}>
          <Card withBorder shadow="sm" radius="md">
            <Card.Section withBorder inheritPadding py="xs">
              <Title order={4}>{dish.dishName}</Title>
            </Card.Section>

            {/* Lifestyles */}
            {hasLifestyle[index] && (
              <Card.Section withBorder inheritPadding py="xs">
                <Text py="xs" weight={"bold"}>
                  Lifestyle
                </Text>
                <List
                  spacing="xs"
                  size="md"
                  center
                  icon={
                    <ThemeIcon
                      variant="light"
                      color="gray"
                      size={24}
                      radius="xl"
                    >
                      <IconCircle size={16} />
                    </ThemeIcon>
                  }
                >
                  {lifestyles.map(
                    (lifestyle, index) =>
                      dish[lifestyle] && (
                        <List.Item key={index}>{dish[lifestyle]}</List.Item>
                      )
                  )}
                </List>
              </Card.Section>
            )}

            {/* Health Tags */}
            {hasHealthTags[index] && (
              <Card.Section withBorder inheritPadding py="xs">
                <Text py="xs" weight={"bold"}>
                  Health Tags
                </Text>
                <List
                  spacing="xs"
                  size="md"
                  center
                  icon={
                    <ThemeIcon
                      variant="light"
                      color="gray"
                      size={24}
                      radius="xl"
                    >
                      <IconCircle size={16} />
                    </ThemeIcon>
                  }
                >
                  {healtTags.map(
                    (healthTag, index) =>
                      dish[healthTag] && (
                        <List.Item key={index}>{dish[healthTag]}</List.Item>
                      )
                  )}
                </List>
              </Card.Section>
            )}

            {/* Ingredients */}
            {hasIngredients[index].length > 0 && (
              <Card.Section withBorder inheritPadding py="xs">
                <Text py="xs" weight={"bold"}>
                  Ingredients
                </Text>
                <Grid>
                  <Grid.Col span={hasIngredients[index].length > 1 ? 6 : 12}>
                    <List
                      spacing="xs"
                      size="md"
                      center
                      icon={
                        <ThemeIcon
                          variant="light"
                          color="gray"
                          size={24}
                          radius="xl"
                        >
                          <IconCircle size={16} />
                        </ThemeIcon>
                      }
                    >
                      {ingredients.map(
                        (ingredient, index) =>
                          dish[ingredient] && (
                            <List.Item key={index}>
                              {dish[ingredient]}
                            </List.Item>
                          )
                      )}
                    </List>
                  </Grid.Col>
                </Grid>
              </Card.Section>
            )}

            {/* Allergens */}
            {hasAllergens[index].length > 0 && (
              <Card.Section withBorder inheritPadding py="xs">
                <Text py="xs" weight={"bold"}>
                  Allergens
                </Text>
                <List
                  spacing="xs"
                  size="md"
                  center
                  icon={
                    <ThemeIcon
                      variant="light"
                      color="gray"
                      size={24}
                      radius="xl"
                    >
                      <IconCircle size={16} />
                    </ThemeIcon>
                  }
                >
                  {allergens.map(
                    (allergen, index) =>
                      dish[allergen] && (
                        <List.Item key={index}>{dish[allergen]}</List.Item>
                      )
                  )}
                </List>
              </Card.Section>
            )}

            {/* Nutrients */}
            <Card.Section withBorder inheritPadding py="xs">
              <Text py="xs" weight={"bold"}>
                Nutrients
              </Text>
              <List
                spacing="xs"
                size="sm"
                center
                icon={
                  <ThemeIcon
                    variant="light"
                    color="green"
                    size={24}
                    radius="xl"
                  >
                    <IconCell size={16} />
                  </ThemeIcon>
                }
              >
                <List.Item>
                  <Text weight={500}>Energy: {dish.energy}</Text>
                </List.Item>
                <List.Item>
                  <Text weight={500}>Fat: {dish.fat}</Text>
                </List.Item>
                <List.Item>
                  <Text weight={500}>Fibre: {dish.fibre}</Text>
                </List.Item>
                <List.Item>
                  <Text weight={500}>Proteins: {dish.protein}</Text>
                </List.Item>
                <List.Item>
                  <Text weight={500}>Sugar: {dish.sugar}</Text>
                </List.Item>
              </List>
            </Card.Section>

            <Card.Section withBorder inheritPadding py="xs">
              <List
                spacing="xs"
                size="sm"
                center
                icon={
                  <ThemeIcon
                    variant="light"
                    color="green"
                    size={24}
                    radius="xl"
                  >
                    <IconTag size={16} />
                  </ThemeIcon>
                }
              >
                <List.Item>
                  <Text weight={500}>{dish.price}</Text>
                </List.Item>
              </List>
            </Card.Section>
          </Card>
        </Grid.Col>
      ))}

      <Accordion defaultValue="customization" style={{ width: "100%" }}>
        <Accordion.Item value="customization">
          <Accordion.Control>Raw Data</Accordion.Control>
          <Accordion.Panel>
            <pre
              style={{
                backgroundColor: "#FAFAFA",
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

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
};

export async function getStaticProps() {
  const app = createFirebaseApp();
  const ref = createFirebaseDb(app);

  // let dishes: string[] | any = [];
  let data: string[] = [];

  const restaurantsData = await get(
    child(ref, "/multiRestaurantUniverse/reveal_restaurant_partners/menuLists")
  );

  if (restaurantsData.exists()) {
    data = restaurantsData.val();

    // console.log(dishes);
  }

  return {
    props: {
      data,
    },
  };
}

export default Restaurant;
