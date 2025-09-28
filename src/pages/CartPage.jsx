import { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { createOrderFromCart, calculateShipping } from '../api/orderService';
import { getMyAddresses, addMyAddress } from '../api/addressService';
import CartItem from '../components/cart/CartItem';

import { Button } from '../components/common/Button';
import { 
  LoaderCircle, 
  ShoppingCart, 
  CheckCircle, 
  ChevronRight, 
  MapPin, 
  Truck, 
  CreditCard, 
  Package
} from 'lucide-react';

export default function CartPage() {
    const { items, subtotal, cartCount, isLoading, clearCart } = useCart();
    const navigate = useNavigate();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [shippingOptions, setShippingOptions] = useState([]);
    const [selectedShipping, setSelectedShipping] = useState(null);

    const [isShippingLoading, setIsShippingLoading] = useState(false);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);

    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressFormData, setAddressFormData] = useState({
        cep: '',
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: ''
    });

    // --- Buscar endereços ---
    const fetchAddresses = useCallback(async () => {
        try {
            const data = await getMyAddresses();
            setAddresses(data || []);
            
            // Se tiver endereços e nenhum selecionado, seleciona o primeiro
            if (data?.length > 0 && !selectedAddress) {
                setSelectedAddress(data[0].id);
                handleAddressChange({target: {value: data[0].id}});
            }
        } catch (error) {
            console.error("Erro ao carregar endereços:", error);
        }
    }, [selectedAddress]);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    // --- Salvar novo endereço ---
    const handleSaveAddress = async (e) => {
        e.preventDefault();
        try {
            const addedAddress = await addMyAddress(addressFormData);
            await fetchAddresses();
            setSelectedAddress(addedAddress.id);
            handleAddressChange({ target: { value: addedAddress.id }});
            setShowAddressForm(false);
            setAddressFormData({ cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' });
        } catch (error) {
            alert("Falha ao salvar o endereço. Verifique os campos.");
        }
    };

    // --- Mudança nos campos ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAddressFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // --- Preencher automático pelo CEP ---
    const handleCepBlur = async (e) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (!data.erro) {
                setAddressFormData(prev => ({
                    ...prev,
                    rua: data.logradouro,
                    bairro: data.bairro,
                    cidade: data.localidade,
                    estado: data.uf,
                }));
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        }
    };

    // --- Selecionar endereço e calcular frete ---
    const handleAddressChange = async (e) => {
        const addressId = e.target.value;
        setSelectedAddress(addressId);
        setShippingOptions([]);
        setSelectedShipping(null);
        if (!addressId) return;

        try {
            setIsShippingLoading(true);
            const options = await calculateShipping(addressId);
            setShippingOptions(options || []);
            
            // Se houver apenas uma opção, seleciona automaticamente
            if (options && options.length === 1) {
                setSelectedShipping(options[0]);
            }
        } catch (error) {
            console.error("Erro ao calcular frete:", error);
            alert("Não foi possível calcular o frete para este endereço.");
        } finally {
            setIsShippingLoading(false);
        }
    };

    // --- Checkout revisado ---
    const handleCheckout = async () => {
        if (!selectedAddress || !selectedShipping) {
            alert("Por favor, selecione um endereço e uma opção de frete.");
            return;
        }

        setIsCreatingOrder(true);

        try {
            const shippingValue = parseFloat(selectedShipping.valor);
            
            // Validando os dados antes de enviar
            if (isNaN(shippingValue) || !selectedAddress) {
                throw new Error("Dados de endereço ou frete inválidos");
            }
            
            const newOrder = await createOrderFromCart(selectedAddress, shippingValue);
            
            // Verifica se o pedido tem ID válido
            if (newOrder && newOrder.id) {
                // Limpa o carrinho após sucesso no pedido
                clearCart();
                navigate(`/pedidos/${newOrder.id}`);
            } else {
                throw new Error("O pedido não retornou um ID válido");
            }
        } catch (error) {
            console.error("Erro ao finalizar pedido:", error);
            alert("Ocorreu um erro ao finalizar seu pedido. Tente novamente.");
        } finally {
            setIsCreatingOrder(false);
        }
    };

    const shippingCost = selectedShipping ? parseFloat(selectedShipping.valor) : 0;
    const total = subtotal + shippingCost;

    // --- Loading do carrinho ---
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64 p-8">
                <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    // --- Carrinho vazio ---
    if (cartCount === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-6 text-center py-20 px-4 max-w-lg mx-auto">
                <div className="h-24 w-24 rounded-full bg-muted/30 flex items-center justify-center">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">Seu carrinho está vazio</h2>
                <p className="text-muted-foreground">Adicione produtos para vê-los aqui e continuar com sua compra.</p>
                <Button asChild size="lg" className="animate-pulse">
                    <RouterLink to="/" className="flex items-center gap-2">
                        Explorar produtos
                        <ChevronRight className="h-4 w-4" />
                    </RouterLink>
                </Button>
            </div>
        );
    }
    // --- Página do carrinho ---
    return (
        <div className="container px-4 py-8 mx-auto max-w-7xl">
            <h1 className="text-3xl font-bold tracking-tight mb-8 text-center md:text-left">
                <span className="inline-block mr-2">Meu Carrinho</span>
                <span className="inline-flex items-center justify-center bg-primary/10 text-primary rounded-full h-8 w-8 text-sm">
                    {cartCount}
                </span>
            </h1>
            
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Coluna Esquerda */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Itens */}
                    <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border/50">
                        <div className="p-4 bg-muted/30">
                            <h2 className="text-lg font-medium flex items-center">
                                <Package className="mr-2 h-5 w-5 text-primary" /> 
                                Itens no carrinho
                            </h2>
                        </div>
                        <div className="divide-y">
                            {items.map(item => (
                                <div key={item.id} className="p-4 hover:bg-muted/20 transition-colors">
                                    <CartItem item={item} />
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Endereços e Frete */}
                    <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border/50">
                        <div className="p-4 bg-muted/30">
                            <h2 className="text-lg font-medium flex items-center">
                                <Truck className="mr-2 h-5 w-5 text-primary" /> 
                                Opções de entrega
                            </h2>
                        </div>
                        <div className="p-4">
                            {showAddressForm ? (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <h3 className="font-medium mb-4 flex items-center">
                                        <MapPin className="h-4 w-4 mr-2 text-primary" /> 
                                        Novo endereço de entrega
                                    </h3>
                                    <form onSubmit={handleSaveAddress} className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <input type="text" name="cep" placeholder="CEP" value={addressFormData.cep} onChange={handleInputChange} onBlur={handleCepBlur} className="w-full rounded-md border px-3 py-2 text-sm" required />
                                            <input type="text" name="estado" placeholder="Estado (UF)" value={addressFormData.estado} onChange={handleInputChange} className="w-full rounded-md border px-3 py-2 text-sm" required />
                                            <input type="text" name="rua" placeholder="Rua" value={addressFormData.rua} onChange={handleInputChange} className="sm:col-span-2 w-full rounded-md border px-3 py-2 text-sm" required />
                                            <input type="text" name="numero" placeholder="Número" value={addressFormData.numero} onChange={handleInputChange} className="w-full rounded-md border px-3 py-2 text-sm" />
                                            <input type="text" name="complemento" placeholder="Complemento" value={addressFormData.complemento} onChange={handleInputChange} className="w-full rounded-md border px-3 py-2 text-sm" />
                                            <input type="text" name="bairro" placeholder="Bairro" value={addressFormData.bairro} onChange={handleInputChange} className="w-full rounded-md border px-3 py-2 text-sm" required />
                                            <input type="text" name="cidade" placeholder="Cidade" value={addressFormData.cidade} onChange={handleInputChange} className="w-full rounded-md border px-3 py-2 text-sm" required />
                                        </div>
                                        <div className="flex justify-end space-x-2 pt-2">
                                            <Button type="button" variant="outline" onClick={() => setShowAddressForm(false)}>Cancelar</Button>
                                            <Button type="submit">Salvar Endereço</Button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h3 className="font-medium">Endereços de entrega</h3>
                                            <p className="text-sm text-muted-foreground">Selecione um endereço para calcular o frete</p>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => setShowAddressForm(true)}>
                                            <MapPin className="mr-1 h-4 w-4" /> Novo Endereço
                                        </Button>
                                    </div>

                                    <select value={selectedAddress} onChange={handleAddressChange} className="w-full border rounded-md px-3 py-2 mb-4">
                                        <option value="">Selecione um endereço</option>
                                        {addresses.map(addr => (
                                            <option key={addr.id} value={addr.id}>
                                                {addr.rua}, {addr.numero} - {addr.bairro}, {addr.cidade} - CEP: {addr.cep}
                                            </option>
                                        ))}
                                    </select>

                                    {isShippingLoading && (
                                        <div className="flex justify-center my-4">
                                            <LoaderCircle className="animate-spin" />
                                        </div>
                                    )}

                                    {shippingOptions.length > 0 && (
                                        <div className="space-y-2">
                                            <h3 className="font-semibold mb-2">Escolha a opção de entrega:</h3>
                                            {shippingOptions.map(option => (
                                                <label key={option.servico} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                                                    <input 
                                                        type="radio" 
                                                        name="shipping" 
                                                        className="mr-3"
                                                        onChange={() => setSelectedShipping(option)}
                                                    />
                                                    <div className="flex justify-between items-center w-full">
                                                        <span>{option.servico}</span>
                                                        <span className="font-bold">R$ {parseFloat(option.valor).toFixed(2).replace('.', ',')}</span>
                                                        <span className="text-sm text-muted-foreground">{option.prazo} dias úteis</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Resumo do Pedido */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 rounded-xl border bg-card shadow-sm overflow-hidden">
                        <div className="p-4 bg-muted/30 border-b border-border">
                            <h2 className="font-medium text-lg">Resumo do Pedido</h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'itens'})</span>
                                    <span className="font-medium">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Frete</span>
                                    {shippingCost > 0 ? (
                                        <span className="font-medium">R$ {shippingCost.toFixed(2).replace('.', ',')}</span>
                                    ) : (
                                        <span className="text-muted-foreground">Calcular</span>
                                    )}
                                </div>
                                <div className="border-t border-dashed pt-4 mt-4">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span className="text-primary">R$ {total.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Impostos incluídos</p>
                                </div>
                            </div>
                            
                            <Button 
                                className="w-full group relative overflow-hidden transition-all"
                                size="lg"
                                disabled={!selectedShipping || isCreatingOrder}
                                onClick={handleCheckout}
                            >
                                {isCreatingOrder ? (
                                    <LoaderCircle className="animate-spin mr-2 h-5 w-5" />
                                ) : (
                                    <>
                                        <span className="mr-2">Finalizar Compra</span>
                                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                                <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform"></span>
                            </Button>
                            
                            <div className="mt-4 text-center">
                                <RouterLink to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    ou continue comprando
                                </RouterLink>
                            </div>
                            
                            <div className="mt-8 grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
                                <div className="flex flex-col items-center gap-1">
                                    <CreditCard className="h-4 w-4" />
                                    <span>Pagamento Seguro</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <Truck className="h-4 w-4" />
                                    <span>Entrega Rápida</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Produtos Garantidos</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}