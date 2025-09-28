import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
    Home, 
    ShoppingCart, 
    ShoppingBag, 
    Package, 
    LogOut 
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
    const { isAuthenticated, user, logout } = useAuth();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    
    
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile && isOpen) onClose();
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isOpen, onClose]);

    
    const sidebarClass = isMobile
        ? `fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`
        : 'hidden md:block w-64 bg-white shadow-md';

    
    const overlayClass = `fixed inset-0 z-20 bg-black/50 transition-opacity duration-300 ${isMobile && isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`;

    
    const links = [
        { to: '/', icon: <Home />, label: 'Início' },
        { to: '/carrinho', icon: <ShoppingCart />, label: 'Carrinho' },
        { to: '/produtos', icon: <ShoppingBag />, label: 'Produtos' },
        { to: '/meus-pedidos', icon: <Package />, label: 'Meus Pedidos' },
    ];

    return (
        <>
            {/* Overlay para fechar o menu em mobile */}
            <div className={overlayClass} onClick={onClose} />

            <aside className={sidebarClass}>
                <div className="flex h-full flex-col overflow-y-auto pt-5 pb-4">
                    <div className="px-4 pb-2 mb-6 border-b">
                        {isAuthenticated && user ? (
                            <div className="flex items-center space-x-2 py-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                                    {user.nome ? user.nome.charAt(0) : 'U'}
                                </div>
                                <div>
                                    {/* Mostrar apenas primeiro e último nome */}
                                    {(() => {
                                        const nomes = user.nome.split(' ');
                                        const exibicao = nomes.length > 1 
                                            ? `${nomes[0]} ${nomes[nomes.length - 1]}` 
                                            : nomes[0];
                                        return <p className="font-medium text-gray-900">{exibicao}</p>;
                                    })()}
                                    <p className="text-xs text-gray-500">Bem-vindo!</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col space-y-2 py-2">
                                <p className="font-medium text-gray-900">Bem-vindo!</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1 px-2">
                        {/* Links */}
                        {links.map((link, index) => (
                            <RouterLink
                                key={index}
                                to={link.to}
                                className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-orange-100 hover:text-orange-700"
                                onClick={isMobile ? onClose : undefined}
                            >
                                <span className="mr-3 text-gray-500">{link.icon}</span>
                                {link.label}
                            </RouterLink>
                        ))}

                        {/* Botão de logout */}
                        {isAuthenticated && (
                            <button
                                onClick={() => {
                                    logout();
                                    if (isMobile) onClose();
                                }}
                                className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="mr-3 h-4 w-4" />
                                Sair
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
