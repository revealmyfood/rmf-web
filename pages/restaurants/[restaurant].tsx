import {
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
import {
  IconApple,
  IconChefHat,
  IconCircleCheck,
  IconReceipt2,
  IconTag,
} from "@tabler/icons";
import { get, child } from "firebase/database";
import { GetStaticPaths } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { createFirebaseApp, createFirebaseDb } from "../../firebase/clientApp";
import { Dish } from "../../interfaces/dishesInterface";

type Props = {
  dishes: Dish[];
};

const Restaurant = ({ dishes }: Props) => {
  const router = useRouter();
  const { restaurant } = router.query;
  const restaurantDishes = dishes[parseInt(restaurant as any)] as Dish[];
  // const categorizedDishes = restaurantDishes.reduce((acc, curr) => {
  //   if (acc[curr.category_1]) {
  //     acc[curr.category_1].push(curr);
  //   } else {
  //     acc[curr.category_1] = [curr];
  //   }
  // }, {});

  return (
    <Grid grow>
      {/* <pre>{JSON.stringify(restaurantDishes, null, 2)}</pre> */}
      <Grid.Col span={12}>
        <Breadcrumbs>
          <Link href="/restaurants" passHref>
            <Anchor component="a">Restaurants</Anchor>
          </Link>
        </Breadcrumbs>
      </Grid.Col>

      {restaurantDishes.map((dish, index) => (
        <Grid.Col span={12} key={index}>
          <Card withBorder shadow="sm" radius="md">
            <Card.Section withBorder inheritPadding py="xs">
              <Title order={5}>{dish.dishName}</Title>
            </Card.Section>
            <Card.Section withBorder inheritPadding py="xs">
              <Text py="xs">{dish.description}</Text>
              <List
                spacing="xs"
                size="md"
                center
                icon={
                  <ThemeIcon variant="light" color="gray" size={24} radius="xl">
                    <IconChefHat size={16} />
                  </ThemeIcon>
                }
              >
                <List.Item>{dish.category_1}</List.Item>
                <List.Item
                  icon={
                    <ThemeIcon
                      variant="light"
                      color="gray"
                      size={24}
                      radius="xl"
                    >
                      <IconApple size={16} />
                    </ThemeIcon>
                  }
                >
                  {dish.energy}
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

  const restaurantsData = await get(child(ref, "/menuLists"));
  let dishes: string[] | any = [];

  if (restaurantsData.exists()) {
    let data = restaurantsData.val();
    dishes = Object.values(data);
  }

  return {
    props: {
      dishes,
    },
  };
}

export default Restaurant;
