
import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { getOrderDetails, payOrderWithPix } from '../api/orderService';


import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { 
  LoaderCircle, CheckCircle2, Copy, 
  AlertTriangle, Package, Truck, CreditCard, Calendar 
} from 'lucide-react';

export default function OrderPage() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [pixData, setPixData] = useState(null);
    const [isLoadingOrder, setIsLoadingOrder] = useState(true);
    const [isGeneratingPix, setIsGeneratingPix] = useState(false);
    const [orderError, setOrderError] = useState(null);
    const [pixError, setPixError] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!id) return;
            try {
                setIsLoadingOrder(true);
                const data = await getOrderDetails(id);
                setOrder(data);
            } catch (err) {
                setOrderError("Não foi possível carregar os detalhes do pedido.");
            } finally {
                setIsLoadingOrder(false);
            }
        };
        fetchOrderDetails();
    }, [id]);

    const handleGeneratePix = async () => {
        setIsGeneratingPix(true);
        setPixError(null);
        try {
            const data = await payOrderWithPix(id);
            setPixData(data);
        } catch (err) {
            setPixError("Não foi possível gerar o pagamento. Tente novamente.");
        } finally {
            setIsGeneratingPix(false);
        }
    };

    const handleCopyToClipboard = () => {
        if (pixData?.pix_copia_e_cola) {
            navigator.clipboard.writeText(pixData.pix_copia_e_cola);
            setToastMessage('Código PIX copiado para a área de transferência!');
            setTimeout(() => setToastMessage(null), 3000);
        }
    };

    const getStatusBadgeClass = () => {
        if (order?.status === 'PAGO') return 'bg-green-100 text-green-800';
        if (order?.status === 'AGUARDANDO_PAGAMENTO') return 'bg-amber-100 text-amber-800';
        return 'bg-slate-100 text-slate-800';
    };
    
    const formatOrderStatus = (status) => {
        if (status === 'PAGO') return 'Pago';
        if (status === 'AGUARDANDO_PAGAMENTO') return 'Aguardando Pagamento';
        return status || 'Status Desconhecido';
    };

    if (isLoadingOrder) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground animate-pulse">Carregando detalhes do pedido...</p>
            </div>
        );
    }

    if (orderError || !order) {
        return (
            <div className="mx-auto my-8 max-w-lg rounded-lg border bg-card p-8 text-center shadow-lg">
                <div className="bg-red-50 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <AlertTriangle className="h-12 w-12 text-red-500" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-900">{orderError || "Pedido não encontrado"}</h2>
                <p className="mt-2 text-gray-600 mb-6">Não conseguimos localizar as informações deste pedido.</p>
                <Button asChild className="mt-4 px-6">
                    <RouterLink to="/">Voltar para a Página Inicial</RouterLink>
                </Button>
            </div>
        );
    }
    
    
    const formatCurrency = (value) => {
        const numValue = parseFloat(String(value || '0').replace(',', '.'));
        return numValue.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    const valorItens = formatCurrency(order.valor_itens);
    const valorFrete = formatCurrency(order.valor_frete);
    const valorTotal = formatCurrency(order.valor_total);

    return (
        <div className="container mx-auto px-4 py-6 max-w-5xl">
            {/* Cabeçalho do Pedido */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-full p-2 shadow-sm">
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Pedido Recebido</h1>
                            <p className="text-sm text-gray-600">
                                Pedido #{order.id} • 
                                <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass()}`}>
                                    {formatOrderStatus(order.status)}
                                </span>
                            </p>
                        </div>
                    </div>
                    <Button asChild variant="outline" className="md:self-start">
                        <RouterLink to="/pedidos">
                            Ver Meus Pedidos
                        </RouterLink>
                    </Button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Coluna Esquerda: Detalhes */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Card de Itens */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Package className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">Itens do Pedido</h2>
                        </div>
                        <div className="space-y-4 divide-y">
                            {(order.itens || []).map(item => {
                                const price = parseFloat(String(item.produto?.preco || '0').replace(',', '.'));
                                const quantity = parseInt(item.quantidade || 1, 10);
                                const totalItemPrice = formatCurrency(price * quantity);
                                return (
                                    <div key={item.id} className="flex justify-between items-center pt-4">
                                        <div className="flex items-center gap-3">
                                            {item.produto?.imagem ? (
                                                <img 
                                                    src={item.produto.imagem} 
                                                    alt={item.produto?.nome} 
                                                    className="h-14 w-14 object-cover rounded-md bg-gray-100"
                                                />
                                            ) : (
                                                <div className="h-14 w-14 bg-gray-100 rounded-md flex items-center justify-center">
                                                    <Package className="h-6 w-6 text-gray-400" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium">{item.produto?.nome || 'Produto'}</p>
                                                <p className="text-sm text-muted-foreground">Qtd: {quantity}</p>
                                            </div>
                                        </div>
                                        <p className="font-medium">{totalItemPrice}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Card de Resumo */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">Resumo de Valores</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <p className="text-gray-600">Subtotal</p>
                                <p>{valorItens}</p>
                            </div>
                            <div className="flex justify-between text-sm">
                                <p className="text-gray-600">Frete</p>
                                <p>{valorFrete}</p>
                            </div>
                            <div className="border-t pt-3 mt-3 flex justify-between">
                                <p className="font-semibold">Total</p>
                                <p className="text-lg font-bold text-primary">{valorTotal}</p>
                            </div>
                        </div>
                    </div>

                    {/* Card de Entrega (opcional, se você tiver os dados) */}
                    {order.endereco && (
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Truck className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-semibold">Informações de Entrega</h2>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="font-medium">{order.endereco.destinatario || 'Destinatário'}</p>
                                <p className="text-gray-700 mt-1">
                                    {order.endereco.rua}, {order.endereco.numero} 
                                    {order.endereco.complemento ? `, ${order.endereco.complemento}` : ''}
                                </p>
                                <p className="text-gray-700">
                                    {order.endereco.bairro}, {order.endereco.cidade} - {order.endereco.estado}
                                </p>
                                <p className="text-gray-700">CEP: {order.endereco.cep}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Coluna Direita: Pagamento */}
                <div className="lg:col-span-5">
                    <div className="bg-white rounded-xl p-6 shadow-sm sticky top-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">Status do Pagamento</h2>
                        </div>

                        {order.status === 'PAGO' && (
                            <div className="bg-green-50 rounded-lg p-5 flex flex-col items-center text-center">
                                <div className="bg-green-100 rounded-full p-3 mb-3">
                                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-medium text-green-800 mb-1">Pagamento Confirmado!</h3>
                                <p className="text-green-700">Seu pedido já está em processamento.</p>
                                
                                <div className="mt-6 w-full">
                                    <Button asChild variant="outline" className="w-full">
                                        <RouterLink to="/produtos">
                                            Continuar Comprando
                                        </RouterLink>
                                    </Button>
                                </div>
                            </div>
                        )}

                        {order.status === 'AGUARDANDO_PAGAMENTO' && (
                            <>
                                {!pixData && (
                                    <div className="bg-amber-50 rounded-lg p-5 text-center">
                                        <h3 className="text-lg font-medium text-amber-800 mb-3">Aguardando seu pagamento</h3>
                                        <p className="text-amber-700 mb-4">Gere o código PIX e finalize seu pagamento.</p>
                                        
                                        <Button 
                                            onClick={handleGeneratePix} 
                                            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 mb-3"
                                            disabled={isGeneratingPix}
                                        >
                                            {isGeneratingPix ? (
                                                <>
                                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> 
                                                    Gerando PIX...
                                                </>
                                            ) : (
                                                'Pagar com PIX'
                                            )}
                                        </Button>
                                        
                                        {pixError && (
                                            <div className="mt-3 text-sm text-center text-red-600 bg-red-50 p-3 rounded-lg">
                                                {pixError}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {pixData && (
                                    <div className="bg-white border rounded-lg p-5 text-center">
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Finalize seu pagamento</h3>
                                        <p className="text-gray-600 mb-4">
                                            Escaneie o QR code ou copie o código PIX abaixo
                                        </p>
                                        
                                        <div className="bg-white p-3 rounded-lg border mb-4 mx-auto w-fit">
                                            <img 
                                                src={`data:image/png;base64,${pixData.qr_code_image}`} 
                                                alt="PIX QR Code" 
                                                className="mx-auto max-w-[200px] rounded-md" 
                                            />
                                        </div>
                                        
                                        <div className="relative">
                                            <Input 
                                                readOnly 
                                                value={pixData.pix_copia_e_cola || ''} 
                                                className="pr-12 bg-gray-50 font-mono text-sm"
                                            />
                                            <button 
                                                onClick={handleCopyToClipboard} 
                                                className="absolute inset-y-0 right-0 flex items-center px-3 text-primary hover:text-primary-dark transition-colors"
                                                title="Copiar código PIX"
                                            >
                                                <Copy className="h-5 w-5" />
                                            </button>
                                        </div>
                                        
                                        <p className="text-sm text-gray-500 mt-4">
                                            O status do seu pedido será atualizado automaticamente após a confirmação do pagamento.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Removido o componente Toast conforme solicitado */}
        </div>
    );
}