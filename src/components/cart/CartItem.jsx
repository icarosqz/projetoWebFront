import { useCart } from '../../contexts/CartContext';
import { Input } from '../common/Input';
import { Trash2 } from 'lucide-react';

export default function CartItem({ item }) {
    const { removeItem, updateQuantity } = useCart();
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';

    // Tratamento de URL de imagem com fallback
    const imageUrl = item.produto?.imagens?.[0]?.url_imagem
      ? `${baseUrl}${item.produto.imagens[0].url_imagem}`
      : "/img/placeholder.png";

    // Manipulação da quantidade com validação
    const handleQuantityChange = (e) => {
        const newQuantity = parseInt(e.target.value, 10);
        if (!isNaN(newQuantity)) {
            updateQuantity(item.produto.id, newQuantity);
        }
    };
    
    // Calcular o preço com validação para evitar NaN
    const itemPrice = parseFloat(item.produto?.preco || 0);
    const itemQuantity = parseInt(item.quantidade || 0, 10);
    const itemTotal = itemPrice * itemQuantity;
    
    return (
        <div className="grid grid-cols-12 items-center gap-4 py-4">
            {/* Imagem */}
            <div className="col-span-3 sm:col-span-2">
                <img
                    src={imageUrl}
                    alt={item.produto?.nome || 'Produto'}
                    className="rounded-md object-cover"
                    style={{ aspectRatio: '1 / 1' }}
                    onError={(e) => {e.target.src = "/img/placeholder.png"}}
                />
            </div>

            {/* Nome do Produto */}
            <div className="col-span-9 sm:col-span-4">
                <p className="font-medium text-foreground">{item.produto?.nome || 'Produto sem nome'}</p>
                <p className="text-sm text-muted-foreground">
                    R$ {itemPrice.toFixed(2).replace('.', ',')} (unidade)
                </p>
            </div>

            {/* Quantidade - com validação adicional */}
            <div className="col-span-4 sm:col-span-2">
                <Input
                    type="number"
                    value={itemQuantity}
                    onChange={handleQuantityChange}
                    className="h-9 w-20 text-center"
                    min="1"
                />
            </div>

            {/* Preço Total do Item */}
            <div className="col-span-5 sm:col-span-2">
                <p className="text-right font-medium">
                    R$ {itemTotal.toFixed(2).replace('.', ',')}
                </p>
            </div>
            
            {/* Botão Remover */}
            <div className="col-span-3 sm:col-span-2 text-right">
                <button 
                    onClick={() => removeItem(item.produto.id)} 
                    className="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-destructive"
                    aria-label="Remover item"
                >
                    <Trash2 className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}