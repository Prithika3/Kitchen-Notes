export type FoodItem = { name: string; emoji: string };
export type FoodGroup = { name: string; emoji: string; items: FoodItem[] };

const i = (name: string, emoji: string): FoodItem => ({ name, emoji });

// Edit this list to add or remove quick-pick items (name + picture)
export const FOOD_GROUPS: FoodGroup[] = [
  {
    name: "Vegetables",
    emoji: "🥦",
    items: [
      i("Tomato", "🍅"),
      i("Onion", "🧅"),
      i("Potato", "🥔"),
      i("Carrot", "🥕"),
      i("Brinjal", "🍆"),
      i("Beans", "🫘"),
      i("Cabbage", "🥬"),
      i("Cauliflower", "🥦"),
      i("Ladies Finger", "🌿"),
      i("Drumstick", "🌱"),
      i("Pumpkin", "🎃"),
      i("Beetroot", "🟣"),
      i("Cucumber", "🥒"),
      i("Capsicum", "🫑"),
      i("Radish", "🌱"),
      i("Bitter Gourd", "🥒"),
      i("Ridge Gourd", "🥒"),
      i("Raw Banana", "🍌"),
      i("Spinach", "🥬"),
      i("Green Chilli", "🌶️"),
      i("Garlic", "🧄"),
      i("Ginger", "🫚"),
      i("Coriander Leaves", "🌿"),
      i("Curry Leaves", "🌿"),
    ],
  },
  {
    name: "Fruits",
    emoji: "🍎",
    items: [
      i("Banana", "🍌"),
      i("Apple", "🍎"),
      i("Orange", "🍊"),
      i("Mango", "🥭"),
      i("Grapes", "🍇"),
      i("Papaya", "🍈"),
      i("Pomegranate", "🍎"),
      i("Watermelon", "🍉"),
      i("Pineapple", "🍍"),
      i("Guava", "🍐"),
      i("Sapota", "🍑"),
      i("Muskmelon", "🍈"),
      i("Lemon", "🍋"),
      i("Coconut", "🥥"),
      i("Strawberry", "🍓"),
      i("Kiwi", "🥝"),
    ],
  },
  {
    name: "Rice & Grains",
    emoji: "🍚",
    items: [
      i("Raw Rice", "🍚"),
      i("Boiled Rice", "🍚"),
      i("Basmati Rice", "🍚"),
      i("Idli Rice", "🍚"),
      i("Rice Flour", "🌾"),
      i("Wheat Flour", "🌾"),
      i("Rava", "🌾"),
      i("Poha", "🍚"),
      i("Ragi", "🌾"),
      i("Oats", "🌾"),
      i("Vermicelli", "🍜"),
    ],
  },
  {
    name: "Dal & Pulses",
    emoji: "🫘",
    items: [
      i("Toor Dal", "🫘"),
      i("Moong Dal", "🫘"),
      i("Urad Dal", "🫘"),
      i("Chana Dal", "🫘"),
      i("Chickpeas", "🫘"),
      i("Green Gram", "🫘"),
      i("Peas", "🫛"),
      i("Rajma", "🫘"),
    ],
  },
  {
    name: "Milk & Eggs",
    emoji: "🥛",
    items: [
      i("Milk", "🥛"),
      i("Curd", "🥣"),
      i("Butter", "🧈"),
      i("Paneer", "🧀"),
      i("Cheese", "🧀"),
      i("Eggs", "🥚"),
    ],
  },
  {
    name: "Water & Drinks",
    emoji: "💧",
    items: [
      i("Drinking Water Can", "💧"),
      i("Water Bottle", "💧"),
      i("Tea Powder", "🍵"),
      i("Coffee Powder", "☕"),
      i("Juice", "🧃"),
      i("Cool Drink", "🥤"),
      i("Soda", "🥤"),
    ],
  },
  {
    name: "Oil & Spices",
    emoji: "🧂",
    items: [
      i("Sunflower Oil", "🌻"),
      i("Coconut Oil", "🥥"),
      i("Gingelly Oil", "🛢️"),
      i("Ghee", "🧈"),
      i("Salt", "🧂"),
      i("Sugar", "🍬"),
      i("Jaggery", "🟤"),
      i("Tamarind", "🌰"),
      i("Mustard", "🌱"),
      i("Cumin", "🌿"),
      i("Pepper", "⚫"),
      i("Turmeric Powder", "🟡"),
      i("Chilli Powder", "🌶️"),
      i("Coriander Powder", "🌿"),
      i("Sambar Powder", "🍲"),
      i("Garam Masala", "🍛"),
    ],
  },
  {
    name: "Meat & Fish",
    emoji: "🍗",
    items: [
      i("Chicken", "🍗"),
      i("Mutton", "🥩"),
      i("Fish", "🐟"),
      i("Prawns", "🦐"),
    ],
  },
  {
    name: "Snacks & Bakery",
    emoji: "🍞",
    items: [
      i("Bread", "🍞"),
      i("Biscuits", "🍪"),
      i("Bun", "🥯"),
      i("Chips", "🍟"),
      i("Mixture", "🥜"),
      i("Sweets", "🍬"),
    ],
  },
  {
    name: "Household",
    emoji: "🧴",
    items: [
      i("Cooking Gas", "🔥"),
      i("Dish Wash Liquid", "🧴"),
      i("Soap", "🧼"),
      i("Detergent", "🧺"),
      i("Floor Cleaner", "🧹"),
      i("Tissue Paper", "🧻"),
    ],
  },
];

const EMOJI_BY_NAME = new Map<string, string>();
FOOD_GROUPS.forEach((g) =>
  g.items.forEach((item) => {
    const key = item.name.toLowerCase();
    if (!EMOJI_BY_NAME.has(key)) EMOJI_BY_NAME.set(key, item.emoji);
  })
);

export function emojiFor(name: string): string | undefined {
  return EMOJI_BY_NAME.get(name.trim().toLowerCase());
}

/** "Tomato" -> "🍅 Tomato" (unchanged if there is no picture for it) */
export function withEmoji(name: string): string {
  const emoji = emojiFor(name);
  return emoji ? `${emoji} ${name}` : name;
}
