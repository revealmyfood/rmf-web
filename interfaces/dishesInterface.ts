export interface RestaurantData {
  [key: string]: DishList;
}

export interface DishList {
  dishItems: {
    menu: object;
  };
}

export interface Dish {
  concept?: string;
  assetPath?: string;
  category_1?: string;
  category_2?: string;
  description?: string;
  dishName?: string;
  energy?: string;
  carbs?: string;
  fat?: string;
  fibre?: string;
  price?: string;
  protein?: string;
  sugar?: string;
  health_tags_0: string;
  health_tags_1: string;
  health_tags_2: string;
  health_tags_3: string;
  health_tags_4: string;
  health_tags_5: string;
  health_tags_6: string;
  health_tags_7: string;
  health_tags_8: string;
  ingredient_1?: string;
  ingredient_2?: string;
  ingredient_3?: string;
  ingredient_4?: string;
  ingredient_5?: string;
  ingredient_6?: string;
  ingredient_7?: string;
  ingredient_8?: string;
  ingredient_9?: string;
  ingredient_10?: string;
  ingredient_11?: string;
  ingredient_12?: string;
  ingredient_13?: string;
  ingredient_14?: string;
  ingredient_15?: string;
  ingredient_16?: string;
  ingredient_17?: string;
  ingredient_18?: string;
  ingredient_19?: string;
  ingredient_20?: string;
  ingredient_21?: string;
  ingredient_22?: string;
  ingredient_23?: string;
  ingredient_24?: string;
  ingredient_25?: string;
  ingredient_26?: string;
  ingredient_27?: string;
  ingredient_28?: string;
  ingredient_29?: string;
  ingredient_30?: string;
  lifestyle_1?: string;
  lifestyle_2?: string;
  lifestyle_3?: string;
  allergens_0?: string;
  allergens_1?: string;
  allergens_2?: string;
  allergens_3?: string;
  allergens_4?: string;
  allergens_5?: string;
  allergens_6?: string;
  allergens_7?: string;
  allergens_8?: string;
  allergens_9?: string;
  allergens_10?: string;
  allergens_11?: string;
  allergens_12?: string;
  allergens_13?: string;
}
