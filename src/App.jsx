
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import OrderPage from './pages/OrderPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/item/:id" element={<ProductDetailPage />} />
        <Route path="/carrinho" element={<CartPage />} />
        <Route path="/pedidos/:id" element={<OrderPage />} /> 

      </Route>
    </Routes>
  );
}

export default App;