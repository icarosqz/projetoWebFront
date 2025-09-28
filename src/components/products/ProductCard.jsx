// src/components/products/ProductCard.jsx
import { Link as RouterLink } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import Price from './Price';
import { Button } from '../common/Button';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  if (!product) return null;

  const handleAddItemToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product.id, 1); // envia apenas o ID do produto
  };

  const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  const placeholderImg = '/img/placeholder.png';
  const rawImage = product.imagens?.[0]?.url_imagem || '';
  const imageUrl = rawImage
    ? (rawImage.startsWith('http')
        ? rawImage
        : (rawImage.startsWith('/static') ? `${baseUrl}${rawImage}` : rawImage))
    : placeholderImg;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border/40 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-md">
      <RouterLink to={`/item/${product.id}`} className="flex flex-grow flex-col">
        <div className="relative overflow-hidden bg-secondary/20 pt-[100%] w-full">
          <img
            alt={product.nome || 'Produto'}
            src={imageUrl}
            className="absolute inset-0 h-full w-full object-cover p-2"
            onError={(e) => { e.currentTarget.src = placeholderImg; }}
          />
        </div>
        <div className="flex flex-grow flex-col p-4">
          <h3 className="line-clamp-2 mb-2 min-h-[2.5rem] font-medium text-foreground">
            {product.nome}
          </h3>
          <Price currentPrice={product.preco} originalPrice={product.preco_original} className="mt-auto" />
        </div>
      </RouterLink>
      <div className="p-4 pt-0">
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAddItemToCart}>
          Adicionar
        </Button>
      </div>
    </div>
  );
}