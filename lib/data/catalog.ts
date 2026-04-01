export interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  image: string;
}

export const CATALOG: CatalogProduct[] = [
  {
    id: "wave-desk",
    name: "Wave Desk Lamp",
    price: 42,
    image: "https://picsum.photos/seed/wave-desk/400/300",
  },
  {
    id: "ash-chair",
    name: "Ash Reading Chair",
    price: 189,
    image: "https://picsum.photos/seed/ash-chair/400/300",
  },
  {
    id: "mono-mug",
    name: "Mono Ceramic Mug",
    price: 24,
    image: "https://picsum.photos/seed/mono-mug/400/300",
  },
  {
    id: "linen-tote",
    name: "Linen Market Tote",
    price: 36,
    image: "https://picsum.photos/seed/linen-tote/400/300",
  },
];
