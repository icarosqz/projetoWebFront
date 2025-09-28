import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Store, ShoppingCart, LogIn, UserCircle, Search, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
    const { items } = useCart();
    const { isAuthenticated, user } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-orange-200 bg-orange-500 shadow-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-white p-2">
                            <Store className="h-6 w-6 text-orange-500" />
                        </div>
                        <RouterLink to="/">
                            <h1 className="text-xl font-bold text-white">
                                MarketFacil
                            </h1>
                        </RouterLink>
                    </div>

                    {/* Barra de Busca */}
                    <div className="hidden flex-1 max-w-2xl mx-8 sm:block">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input 
                                type="search" 
                                placeholder="Buscar produtos..." 
                                className="pl-10 pr-4 py-2 w-full bg-white border-0 focus-visible:ring-2 focus-visible:ring-orange-300 placeholder:text-gray-500" 
                            />
                        </div>
                    </div>

                    {/* Ações do Usuário */}
                    <div className="flex items-center space-x-4">
                        {/* Carrinho */}
                        <RouterLink to="/carrinho" className="relative text-white transition-colors hover:text-orange-100" aria-label={`Carrinho com ${items.length} itens`}>
                            <ShoppingCart className="h-5 w-5" />
                            {items.length > 0 && (
                                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                    {items.length}
                                </span>
                            )}
                        </RouterLink>

                        {/* Usuário/Login */}
                        {isAuthenticated && user ? (
                            <div className="flex items-center gap-2 text-white">
                                <UserCircle className="h-6 w-6" />
                                <span className="hidden text-sm font-medium sm:inline-block">
                                    {user.nome.split(' ')[0]}
                                </span>
                            </div>
                        ) : (
                        <RouterLink to="/login">
                            <Button variant="secondary" className="bg-white text-orange-500 hover:bg-orange-50">
                                <LogIn className="mr-2 h-4 w-4" />
                                Login
                            </Button>
                        </RouterLink>
                        )}
                        
                        {/* Menu Mobile */}
                        <button 
                            className="inline-flex items-center justify-center p-2 rounded-md text-white md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}