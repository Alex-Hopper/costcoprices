export type SearchResultItem = {
  id: string;
  name: string;
  price: number;
  image: string;
};

const SEARCH_RESULTS: SearchResultItem[] = [
  {
    id: "1001",
    name: "Kirkland Chicken Breast Boneless Skinless",
    price: 24.99,
    image: "/hero-images/chicken.png",
  },
  {
    id: "1002",
    name: "Organic Chicken Breast Fillets",
    price: 29.99,
    image: "/hero-images/chicken.png",
  },
  {
    id: "1003",
    name: "Kirkland Lactose Free Milk",
    price: 6.49,
    image: "/hero-images/milk.png",
  },
  {
    id: "1004",
    name: "2% Milk 4L Jug",
    price: 5.99,
    image: "/hero-images/milk.png",
  },
];

export function slugifyQuery(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function queryFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .join(" ");
}

export function searchItemsBySlug(slug: string) {
  const terms = queryFromSlug(slug)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (!terms.length) return [];

  return SEARCH_RESULTS.filter((item) =>
    terms.every((term) => item.name.toLowerCase().includes(term))
  );
}
