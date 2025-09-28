import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './Header';
import SideBar from './SideBar';

export default function Layout() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detecta mudanças no tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      
      <div className="flex flex-1">
        {/* SideBar não é exibida em dispositivos móveis */}
        {!isMobile && <SideBar />}
        
        {/* Conteúdo principal */}
        <main className="flex-1">
          <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}