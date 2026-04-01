export interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  image: string;
}

export const CATALOG: CatalogProduct[] = [
  {
    id: "grid-team-cap",
    name: "Grid Series team cap",
    price: 38,
    image: "f1-caps.webp",
  },
  {
    id: "scale-model-143",
    name: "1:43 championship die-cast",
    price: 64,
    image: "diecast.webp",
  },
  {
    id: "paddock-softshell",
    name: "Paddock soft-shell jacket",
    price: 179,
    image: "jacket.webp",
  },
  {
    id: "helmet-desk-lamp",
    name: "Mini helmet desk lamp",
    price: 89,
    image: "minihelmet.avif",
  },
  {
    id: "slick-mug",
    name: "Slick-compound stack mug",
    price: 22,
    image: "mug.webp",
  },
  {
    id: "circuit-poster",
    name: "Circuit layout art print",
    price: 48,
    image: "print.webp",
  }
];
