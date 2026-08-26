/**
 * Sugar Sorcery menu — transcribed from the official menu card.
 * Nothing here is invented: names, prices and variant labels come from the menu.
 *
 * ADDING PRODUCT IMAGES LATER:
 * 1. Upload the image and create an asset pointer, then import it here, e.g.
 *      import chocolateBomboloni from "@/assets/chocolate-bomboloni.jpeg.asset.json";
 *    and set `image: chocolateBomboloni.url` on the matching product.
 * 2. Or simply drop the file in `public/products/` and set
 *      image: "/products/chocolate-bomboloni.jpg"
 */

export type Variant = {
  label: string;
  price: number;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  variants: Variant[];
  /** Product photo. Leave undefined until the real photo is uploaded. */
  image?: string;
};

export type Category = {
  id: string;
  name: string;
  products: Product[];
};

export const menu: Category[] = [
  {
    id: "bombolonis",
    name: "Bombolonis",
    products: [
      {
        id: "bombo-chocolate",
        name: "Chocolate",
        category: "Bombolonis",
        variants: [
          { label: "Box of 2", price: 270 },
          { label: "Box of 4", price: 560 },
          { label: "Box of 6", price: 800 },
        ],
      },
      {
        id: "bombo-pastry-cream",
        name: "Pastry Cream",
        category: "Bombolonis",
        variants: [
          { label: "Box of 2", price: 240 },
          { label: "Box of 4", price: 480 },
          { label: "Box of 6", price: 720 },
        ],
      },
      {
        id: "bombo-caramelized-milk",
        name: "Caramelized Milk",
        category: "Bombolonis",
        variants: [
          { label: "Box of 2", price: 300 },
          { label: "Box of 4", price: 680 },
          { label: "Box of 6", price: 900 },
        ],
      },
      {
        id: "bombo-milk-chocolate-cardamom",
        name: "Milk Chocolate Cardamom",
        category: "Bombolonis",
        variants: [
          { label: "Box of 2", price: 300 },
          { label: "Box of 4", price: 600 },
          { label: "Box of 6", price: 900 },
        ],
      },
    ],
  },
  {
    id: "cookies",
    name: "Cookies",
    products: [
      {
        id: "cookie-triple-chocolate",
        name: "Triple Chocolate",
        category: "Cookies",
        variants: [{ label: "Each", price: 100 }],
      },
      {
        id: "cookie-chocolate-orange",
        name: "Chocolate Orange",
        category: "Cookies",
        variants: [{ label: "Each", price: 100 }],
      },
      {
        id: "cookie-smores",
        name: "S'mores",
        category: "Cookies",
        variants: [{ label: "Each", price: 150 }],
      },
      {
        id: "cookie-orange-pistachio",
        name: "Orange Pistachio",
        category: "Cookies",
        variants: [{ label: "Each", price: 130 }],
      },
    ],
  },
  {
    id: "brownies",
    name: "Brownies",
    products: [
      {
        id: "brownie-classic-chocolate",
        name: "Classic Chocolate",
        category: "Brownies",
        variants: [
          { label: "Box of 4", price: 450 },
          { label: "Box of 6", price: 600 },
        ],
      },
      {
        id: "brownie-tiramisu",
        name: "Tiramisu",
        category: "Brownies",
        variants: [
          { label: "Box of 4", price: 800 },
          { label: "Box of 6", price: 1000 },
        ],
      },
      {
        id: "brownie-matcha-swirl",
        name: "Matcha Swirl",
        category: "Brownies",
        variants: [
          { label: "Box of 4", price: 800 },
          { label: "Box of 6", price: 900 },
        ],
      },
      {
        id: "brownie-caramel",
        name: "Caramel",
        category: "Brownies",
        variants: [
          { label: "Box of 4", price: 500 },
          { label: "Box of 6", price: 650 },
        ],
      },
    ],
  },
  {
    id: "classic-cakes",
    name: "Classic Cakes",
    products: [
      {
        id: "cake-classic-chocolate",
        name: "Classic Chocolate",
        category: "Classic Cakes",
        variants: [
          { label: "½ KG", price: 600 },
          { label: "1 KG", price: 1100 },
        ],
      },
      {
        id: "cake-orange-chocolate",
        name: "Orange Chocolate",
        category: "Classic Cakes",
        variants: [
          { label: "½ KG", price: 700 },
          { label: "1 KG", price: 1300 },
        ],
      },
      {
        id: "cake-salted-caramel",
        name: "Salted Caramel",
        category: "Classic Cakes",
        variants: [
          { label: "½ KG", price: 700 },
          { label: "1 KG", price: 1300 },
        ],
      },
      {
        id: "cake-nutella-hazelnut",
        name: "Nutella Hazelnut",
        category: "Classic Cakes",
        variants: [
          { label: "½ KG", price: 800 },
          { label: "1 KG", price: 1500 },
        ],
      },
      {
        id: "cake-chocolate-peanutbutter",
        name: "Chocolate Peanutbutter",
        category: "Classic Cakes",
        variants: [
          { label: "½ KG", price: 600 },
          { label: "1 KG", price: 1200 },
        ],
      },
      {
        id: "cake-mixed-fruit",
        name: "Mixed Fruit Cake",
        category: "Classic Cakes",
        variants: [
          { label: "½ KG", price: 600 },
          { label: "1 KG", price: 1200 },
        ],
      },
      {
        id: "cake-lemon-blueberry",
        name: "Lemon Blueberry",
        category: "Classic Cakes",
        variants: [
          { label: "½ KG", price: 900 },
          { label: "1 KG", price: 1500 },
        ],
      },
      {
        id: "cake-coconut-pineapple",
        name: "Coconut Pineapple",
        category: "Classic Cakes",
        variants: [
          { label: "½ KG", price: 650 },
          { label: "1 KG", price: 1200 },
        ],
      },
      {
        id: "cake-lotus-biscoff",
        name: "Lotus Biscoff",
        category: "Classic Cakes",
        variants: [
          { label: "½ KG", price: 750 },
          { label: "1 KG", price: 1400 },
        ],
      },
      {
        id: "cake-opera",
        name: "Opera",
        category: "Classic Cakes",
        variants: [
          { label: "½ KG", price: 700 },
          { label: "1 KG", price: 1400 },
        ],
      },
    ],
  },
  {
    id: "basque-cheesecake",
    name: "Basque Cheesecake",
    products: [
      {
        id: "basque-classic",
        name: "Classic",
        category: "Basque Cheesecake",
        variants: [
          { label: "½ KG", price: 800 },
          { label: "1 KG", price: 1600 },
        ],
      },
      {
        id: "basque-chocolate",
        name: "Chocolate",
        category: "Basque Cheesecake",
        variants: [
          { label: "½ KG", price: 900 },
          { label: "1 KG", price: 1800 },
        ],
      },
      {
        id: "basque-espresso",
        name: "Espresso",
        category: "Basque Cheesecake",
        variants: [
          { label: "½ KG", price: 950 },
          { label: "1 KG", price: 1850 },
        ],
      },
      {
        id: "basque-matcha",
        name: "Matcha",
        category: "Basque Cheesecake",
        variants: [
          { label: "½ KG", price: 1100 },
          { label: "1 KG", price: 2200 },
        ],
      },
    ],
  },
];

export const allProducts: Product[] = menu.flatMap((c) => c.products);

export function findProduct(id: string): Product | undefined {
  return allProducts.find((p) => p.id === id);
}

export const bakery = {
  name: "Sugar Sorcery",
  tagline: "Magic in Every Bite",
  menuTagline: "Spellbindingly Delicious",
  address: "Kharghar, Navi Mumbai",
  email: "ishitagupte00@gmail.com",
  phone: "7710865577",
  phoneHref: "tel:+917710865577",
  whatsappHref: "https://wa.me/917710865577",
  instagram:
    "https://www.instagram.com/sugar_sorcery_?igsi=MTNiOHA1NTM0cTN2aA==",
  /** Replace with the exact Google Maps link once provided. */
  mapsUrl: "",
  hours: "Open at all times",
  orders: "Pre-order only",
  upiId: "ishitagupte00-1@okhdfcbank",
  upiName: "Ishita Gupte",
};

