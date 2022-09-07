import React from "react";
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
} from "@mantine/core";
import { IconCircle, IconCell, IconTag, IconApple } from "@tabler/icons";
import { Dish } from "../interfaces/dishesInterface";

interface Props {
  dish: Dish;
  hasLifestyle: Array<string>;
  hasHealthTags: Array<string>;
  hasIngredients: Array<string>;
  hasAllergens: Array<string>;
}

const DishCard = ({
  dish,
  hasAllergens,
  hasHealthTags,
  hasIngredients,
  hasLifestyle,
}: Props) => {
  return (
    <>
      <Grid.Col span={12}>
        <Card withBorder shadow="sm" radius="md" p="md">
          <Card.Section inheritPadding p="md">
            <Group position="apart">
              <Title order={5}>{dish.dishName}</Title>
              <Badge size="xl" radius="md">
                {dish.price} £
              </Badge>
            </Group>
          </Card.Section>

          <Card.Section withBorder inheritPadding py="xs">
            <Text weight={400}>{dish.description}</Text>
          </Card.Section>

          {/* Lifestyles */}
          {hasLifestyle && (
            <Card.Section inheritPadding py="xs" px="xs">
              <Group position="left" spacing={"sm"}>
                {Object.entries(dish)
                  .filter(([key]) => key.match(/lifestyle_/))
                  .map(([key, lifestyle]) => (
                    <Badge
                      size="lg"
                      key={key}
                      variant="gradient"
                      gradient={{ from: "green", to: "lime" }}
                    >
                      {lifestyle}
                    </Badge>
                  ))}
              </Group>
            </Card.Section>
          )}

          {/* Health Tags */}
          {hasHealthTags && (
            <Card.Section withBorder inheritPadding py="xs">
              <Group position="left" spacing={"sm"}>
                {Object.entries(dish)
                  .filter(([key]) => key.match(/health_tag/))
                  .map(([key, healthTag]) => (
                    <Chip
                      checked
                      size="sm"
                      variant="filled"
                      color="green"
                      key={key}
                    >
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
              chevronPosition="left"
              defaultValue="customization"
              variant="contained"
              py={"sm"}
            >
              {/* Ingredients */}
              <Accordion.Item value="ingredients">
                <Accordion.Control>Show Ingredients</Accordion.Control>
                <Accordion.Panel>
                  {hasIngredients.length > 0 && (
                    <Card.Section withBorder inheritPadding py="xs">
                      <Grid grow>
                        <Grid.Col span={12}>
                          <List
                            spacing="xs"
                            size="md"
                            center
                            icon={
                              <ThemeIcon
                                variant="filled"
                                color="green"
                                size={24}
                                radius="xl"
                              >
                                <IconApple size={16} />
                              </ThemeIcon>
                            }
                          >
                            {Object.entries(dish)
                              .filter(([key]) => key.match(/ingredient_/))
                              .map(([key, ingredient]) => (
                                <List.Item key={key}>{ingredient}</List.Item>
                              ))}
                          </List>
                        </Grid.Col>
                      </Grid>
                    </Card.Section>
                  )}
                </Accordion.Panel>
              </Accordion.Item>

              {/* Nutrients */}
              <Accordion.Item value="nutrients">
                <Accordion.Control>Show Nutrients</Accordion.Control>
                <Accordion.Panel>
                  <List
                    spacing="xs"
                    size="md"
                    center
                    icon={
                      <ThemeIcon
                        variant="filled"
                        color="green"
                        size={24}
                        radius="xl"
                      >
                        <IconCell size={16} />
                      </ThemeIcon>
                    }
                  >
                    <List.Item>
                      <Text>Energy: {dish.energy}</Text>
                    </List.Item>
                    <List.Item>
                      <Text>Fat: {dish.fat}</Text>
                    </List.Item>
                    <List.Item>
                      <Text>Fibre: {dish.fibre}</Text>
                    </List.Item>
                    <List.Item>
                      <Text>Proteins: {dish.protein}</Text>
                    </List.Item>
                    <List.Item>
                      <Text>Sugar: {dish.sugar}</Text>
                    </List.Item>
                  </List>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Card.Section>

          {/* Allergens */}
          {hasAllergens.length > 0 && (
            <Card.Section withBorder inheritPadding py="xs">
              <List
                spacing="xs"
                size="md"
                center
                icon={
                  <ThemeIcon variant="light" color="gray" size={24} radius="xl">
                    <IconCircle size={16} />
                  </ThemeIcon>
                }
              >
                {Object.entries(dish)
                  .filter(([key]) => key.match(/allergen_/))
                  .map(([key, allergen]) => (
                    <List.Item key={key}>{allergen}</List.Item>
                  ))}
              </List>
            </Card.Section>
          )}
        </Card>
      </Grid.Col>
    </>
  );
};

export default DishCard;
