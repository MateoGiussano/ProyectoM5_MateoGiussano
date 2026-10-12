export type ProductCategory = 'Estándar' | 'Pro';

export interface Product {
    id: string;
    name: string;
    image: string;
    description: string;
    price: number;
    stock: number;
    category: ProductCategory;
}