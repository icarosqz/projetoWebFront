// src/pages/OrdersListPage.jsx
import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getMyOrders } from '../api/orderService';

// Nossos componentes e ícones
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { 
  LoaderCircle, Package, Truck, Search,
  AlertTriangle, Calendar, ShoppingBag, ArrowUpDown
} from 'lucide-react';

export default function OrdersListPage() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('desc'); // desc = mais recente primeiro

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setIsLoading(true);
                const data = await getMyOrders();
                setOrders(data);
            } catch (err) {
                setError("Não foi possível carregar seus pedidos.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    };

    const formatCurrency = (value) => {
        const numValue = parseFloat(String(value || '0').replace(',', '.'));
        return numValue.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    const getStatusBadgeClass = (status) => {
        if (status === 'PAGO') return 'bg-green-100 text-green-800';
        if (status === 'AGUARDANDO_PAGAMENTO') return 'bg-amber-100 text-amber-800';
        if (status === 'ENVIADO') return 'bg-blue-100 text-blue-800';
        if (status === 'ENTREGUE') return 'bg-purple-100 text-purple-800';
        if (status === 'CANCELADO') return 'bg-red-100 text-red-800';
        return 'bg-slate-100 text-slate-800';
    };
    
    const formatOrderStatus = (status) => {
        const statusMap = {
            'PAGO': 'Pago',
            'AGUARDANDO_PAGAMENTO': 'Aguardando Pagamento',
            'ENVIADO': 'Enviado',
            'ENTREGUE': 'Entregue',
            'CANCELADO': 'Cancelado'
        };
        
        return statusMap[status] || status || 'Status Desconhecido';
    };

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    };

    const filteredOrders = orders
        .filter(order => {
            if (!filterStatus) return true;
            return order.status === filterStatus;
        })
        .filter(order => {
            if (!searchTerm) return true;
            const term = searchTerm.toLowerCase();
            return (
                order.id.toLowerCase().includes(term) || 
                (order.endereco?.cidade?.toLowerCase().includes(term))
            );
        })
        .sort((a, b) => {
            const dateA = new Date(a.data_criacao || 0);
            const dateB = new Date(b.data_criacao || 0);
            
            if (sortOrder === 'desc') {
                return dateB - dateA; // Mais recente primeiro
            } else {
                return dateA - dateB; // Mais antigo primeiro
            }
        });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground animate-pulse">Carregando seus pedidos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto my-8 max-w-lg rounded-lg border bg-card p-8 text-center shadow-lg">
                <div className="bg-red-50 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <AlertTriangle className="h-12 w-12 text-red-500" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-900">{error}</h2>
                <p className="mt-2 text-gray-600 mb-6">Tente novamente mais tarde ou entre em contato com o suporte.</p>
                <Button asChild className="mt-4 px-6">
                    <RouterLink to="/">Voltar para a Página Inicial</RouterLink>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-5xl">
            {/* Cabeçalho da Página */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-full p-2 shadow-sm">
                            <ShoppingBag className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Meus Pedidos</h1>
                            <p className="text-sm text-gray-600">
                                Visualize e acompanhe todos os seus pedidos
                            </p>
                        </div>
                    </div>
                    <Button asChild variant="outline" className="md:self-start">
                        <RouterLink to="/produtos">
                            Continuar Comprando
                        </RouterLink>
                    </Button>
                </div>
            </div>

            {/* Filtros e Busca */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar pedidos..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <select 
                            className="w-full px-3 py-2 border rounded-md text-sm"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">Todos os status</option>
                            <option value="AGUARDANDO_PAGAMENTO">Aguardando Pagamento</option>
                            <option value="PAGO">Pago</option>
                            <option value="ENVIADO">Enviado</option>
                            <option value="ENTREGUE">Entregue</option>
                            <option value="CANCELADO">Cancelado</option>
                        </select>
                    </div>
                    
                    <Button 
                        variant="outline" 
                        onClick={toggleSortOrder} 
                        className="flex items-center justify-center gap-2"
                    >
                        <ArrowUpDown className="h-4 w-4" />
                        {sortOrder === 'desc' ? 'Mais recentes primeiro' : 'Mais antigos primeiro'}
                    </Button>
                </div>
            </div>

            {/* Lista de Pedidos */}
            {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido encontrado</h3>
                    <p className="text-gray-600 mb-6">
                        {!orders.length 
                            ? "Você ainda não fez nenhum pedido." 
                            : "Nenhum pedido corresponde aos filtros aplicados."}
                    </p>
                    <Button asChild>
                        <RouterLink to="/produtos">
                            Começar a comprar
                        </RouterLink>
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">
                                            Pedido em {formatDate(order.data_criacao)}
                                        </span>
                                    </div>
                                    <h3 className="font-medium">Pedido #{order.id}</h3>
                                </div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                                        {formatOrderStatus(order.status)}
                                    </span>
                                    <span className="font-bold text-primary">
                                        {formatCurrency(order.valor_total)}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="border-t pt-4 mt-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Miniatura de itens */}
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Itens</p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {order.itens && order.itens.length > 0 ? (
                                                <>
                                                    <div className="flex -space-x-2">
                                                        {order.itens.slice(0, 3).map((item, index) => (
                                                            <div 
                                                                key={index} 
                                                                className="h-10 w-10 rounded-md border bg-gray-50 overflow-hidden"
                                                            >
                                                                {item.produto?.imagem ? (
                                                                    <img 
                                                                        src={item.produto.imagem} 
                                                                        alt={item.produto?.nome} 
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <Package className="h-full w-full p-2 text-gray-400" />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {order.itens.length > 3 && (
                                                        <span className="text-xs text-gray-500">
                                                            +{order.itens.length - 3} itens
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-sm text-gray-500">Sem itens disponíveis</span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Informações de entrega */}
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Entrega</p>
                                        <div className="flex items-start gap-2">
                                            <Truck className="h-4 w-4 text-gray-500 mt-0.5" />
                                            <p className="text-sm text-gray-600">
                                                {order.endereco ? (
                                                    <>
                                                        {order.endereco.cidade}, {order.endereco.estado}<br/>
                                                        <span className="text-xs">CEP: {order.endereco.cep}</span>
                                                    </>
                                                ) : (
                                                    'Sem informações de entrega'
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t flex justify-end">
                                    <Button asChild>
                                        <RouterLink to={`/pedidos/${order.id}`}>
                                            Ver Detalhes
                                        </RouterLink>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Paginação (opcional) */}
            {filteredOrders.length > 10 && (
                <div className="mt-6 flex justify-center">
                    <nav className="flex items-center gap-1">
                        <Button variant="outline" size="sm" disabled>Anterior</Button>
                        <Button variant="outline" size="sm" className="bg-primary text-white">1</Button>
                        <Button variant="outline" size="sm">2</Button>
                        <Button variant="outline" size="sm">3</Button>
                        <Button variant="outline" size="sm">Próxima</Button>
                    </nav>
                </div>
            )}
        </div>
    );
}