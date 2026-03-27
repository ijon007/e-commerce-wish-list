"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import productTestImage from "@/public/productTest.webp"
import Navbar from "@/components/custom/navbar";

interface WishListProduct {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
}
export default function ProductPage() {
    const [wishListProducts, setWishListProducts] = useState<WishListProduct[]>([]);
    const dummyProduct: WishListProduct = {
        id: Math.random() + Date.now(),
        name: "Example Product",
        description: "Product Description",
        price: 19.99,
        image: productTestImage.src
    }
    return (
        <>
            <Navbar/>
            <div className="flex justify-center m-auto grid-cols-2 gap-10">
                <Card className="min-w-[250px] h-fit my-auto">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl">{dummyProduct.name}</CardTitle>
                        <CardDescription className="mr-20">
                            {dummyProduct.description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Separator />
                        <img src={dummyProduct.image} alt="Product Image" width={200} height={200} className="rounded-lg mx-auto" />
                        <Button
                            className="w-full"
                            onClick={() => setWishListProducts(prev => [...prev, { ...dummyProduct, id: Math.random() + Date.now() }])}
                        >
                            Add to Wish List
                        </Button>
                    </CardContent>
                </Card>
                <Card className="min-w-[250px]">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl">Wish List</CardTitle>
                        <div className="flex items-center justify-between">
                            <CardDescription>
                                Products
                            </CardDescription>
                            <Button disabled={wishListProducts.length === 0} variant={"destructive"} size={"sm"} onClick={() => setWishListProducts([])}>
                                Clear Wish List
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Separator />
                        {wishListProducts.length === 0 ?
                            <div className="m-auto my-[100px]">
                                <span className="font-lg">No products in wish list</span>
                            </div>
                            :
                            <div className="grid gap-10 max-h-[250px] overflow-y-auto">
                                {wishListProducts.map((product: WishListProduct, i: number) => (
                                    <div key={i} className="flex">
                                        <img src={product.image} alt="Product Image" width={100} height={100} className="rounded-lg mx-auto" />
                                        <div className="font-sm my-auto px-2">
                                            <p>{product.name}</p>
                                            <p>{product.description}</p>
                                            <p>{product.price}</p>
                                            <Button variant={"destructive"} size={"sm"} onClick={() => setWishListProducts(prev => prev.filter(p => p.id !== product.id))}>
                                                Remove Product
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        }
                    </CardContent>
                </Card>
            </div>
</>    
)
}