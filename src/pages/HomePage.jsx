
import { useState, useEffect } from 'react';
import { getProducts } from '../api/productService';
import ProductCard from '../components/products/ProductCard';
import { LoaderCircle, AlertTriangle } from 'lucide-react'; 

export default function HomePage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data || []);
            } catch (err) {
                setError('Não foi possível carregar os produtos.');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 p-12 text-muted-foreground">
                <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
                <p className="text-lg">Carregando produtos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto mt-8 max-w-2xl flex flex-col items-center justify-center gap-3 rounded-md border border-destructive/50 bg-destructive/10 p-6 text-destructive">
                <AlertTriangle className="h-8 w-8" />
                <p className="font-medium text-lg">{error}</p>
            </div>
        );
    }

    return (
        <div className="py-6">
            <div className="mb-8 border-b border-border/60 pb-4">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Produtos em Destaque
                </h1>
                <p className="mt-2 text-muted-foreground">Confira nossa seleção de produtos especiais.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}