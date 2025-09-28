// src/pages/ProductDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../api/productService';
import ProductImageGallery from '../components/products/ProductImageGallery';
import Price from '../components/products/Price';
import { useCart } from '../contexts/CartContext';

// Nossos componentes e ícones
import { Button } from '../components/common/Button';
import { 
  LoaderCircle, 
  AlertTriangle, 
  ShoppingCart, 
  Star, 
  StarHalf,
  Package, 
  Scale, 
  Ruler, 
  Store, 
  Tag, 
  Layers, 
  Minus, 
  Plus, 
  Share2, 
  Heart 
} from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('descricao');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setError(null);
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
        // Resetar quantidade quando mudar de produto
        setQuantity(1);
      } catch (err) {
        setError('Produto não encontrado ou erro ao carregar.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    // Rolar para o topo ao carregar um novo produto
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    addItemToCart(product.id, 1);
  };

  const incrementQuantity = () => {
    if (quantity < (product?.estoque || 10)) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-5 w-5 fill-primary text-primary" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-5 w-5 fill-primary text-primary" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-5 w-5 text-muted-foreground" />);
    }
    
    return stars;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-2 p-8 text-muted-foreground">
        <LoaderCircle className="h-12 w-12 animate-spin" />
        <p className="text-lg animate-pulse mt-4">Carregando produto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-destructive">
        <AlertTriangle className="h-10 w-10" />
        <p className="text-xl font-medium">{error}</p>
        <Button variant="outline" asChild>
          <Link to="/">Voltar para a página inicial</Link>
        </Button>
      </div>
    );
  }

  if (!product) {
    return <p className="text-center py-12 text-lg">Produto não encontrado.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-primary transition-colors">Início</Link>
        {product.categoria && (
          <>
            <span className="mx-2">/</span>
            <Link to={`/categorias/${product.categoria?.slug}`} className="hover:text-primary transition-colors">
              {product.categoria.nome}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium">{product.nome}</span>
      </div>
      
      <div className="bg-card rounded-xl shadow-md overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          {/* Coluna da Galeria de Imagens */}
          <div className="bg-background rounded-lg p-4">
            <ProductImageGallery images={product.imagens} />
          </div>

          {/* Coluna de Informações do Produto */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {product.nome}
              </h1>
              
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="rounded-full" title="Compartilhar">
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full" title="Favoritar">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Avaliações */}
            {product.avaliacoes_media && (
              <div className="flex items-center mt-2 gap-2">
                <div className="flex">
                  {renderStars(product.avaliacoes_media)}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.avaliacoes_media.toFixed(1)} ({product.avaliacoes_count} avaliações)
                </span>
              </div>
            )}
            
            {/* Loja */}
            <div className="flex items-center mt-3">
              <Store className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-sm text-muted-foreground mr-2">Vendido por:</span>
              <Link to={`/lojas/${product.loja_id}`} className="text-sm font-medium hover:text-primary transition-colors">
                {product.loja.nome_fantasia}
              </Link>
            </div>
            
            {/* Preço */}
            <div className="mt-6 bg-muted/40 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="mr-auto">
                  <Price 
                    currentPrice={product.preco} 
                    originalPrice={product.preco_original}
                    size="large"
                  />
                  {product.estoque > 0 ? (
                    <p className="text-sm text-green-600 mt-1">Em estoque ({product.estoque} unidades)</p>
                  ) : (
                    <p className="text-sm text-destructive mt-1">Fora de estoque</p>
                  )}
                </div>
                
                {/* Parcelamento */}
                <div className="text-right">
            
                  <p className="text-xs text-muted-foreground">
                    {parseFloat(product.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} à vista
                  </p>
                </div>
              </div>
            </div>
            
            {/* Quantidade e Add ao Carrinho */}
            <div className="mt-6 flex items-center">
              <div className="flex items-center border rounded-md overflow-hidden mr-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="rounded-none h-10"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="w-12 text-center">
                  <input
                    type="text"
                    value={quantity}
                    readOnly
                    className="w-full text-center focus:outline-none bg-transparent"
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={incrementQuantity}
                  disabled={quantity >= product.estoque}
                  className="rounded-none h-10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                size="lg"
                className="w-full flex items-center justify-center"
                onClick={handleAddToCart}
                disabled={product.estoque <= 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Adicionar ao Carrinho
              </Button>
            </div>
            
            {/* Informações técnicas resumidas */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center p-3 bg-muted/30 rounded-lg">
                <Package className="h-5 w-5 text-muted-foreground mr-2" />
                <div>
                  <p className="text-xs text-muted-foreground">Dimensões</p>
                  <p className="text-sm">{product.altura}×{product.largura}×{product.comprimento} cm</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-muted/30 rounded-lg">
                <Scale className="h-5 w-5 text-muted-foreground mr-2" />
                <div>
                  <p className="text-xs text-muted-foreground">Peso</p>
                  <p className="text-sm">{product.peso} kg</p>
                </div>
              </div>
              
              {product.categoria && (
                <div className="flex items-center p-3 bg-muted/30 rounded-lg">
                  <Layers className="h-5 w-5 text-muted-foreground mr-2" />
                  <div>
                    <p className="text-xs text-muted-foreground">Categoria</p>
                    <p className="text-sm truncate">{product.categoria.nome}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Tags do produto */}
            {product.tags && product.tags.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-1 flex-wrap">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  {product.tags.map(tag => (
                    <Link 
                      key={tag.id} 
                      to={`/tags/${tag.slug}`}
                      className="px-2 py-1 text-xs bg-muted rounded-md hover:bg-primary/10 transition-colors"
                    >
                      {tag.nome}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Abas de informações adicionais */}
        <div className="border-t mt-8">
          <div className="flex overflow-x-auto">
            <button 
              onClick={() => setActiveTab('descricao')}
              className={`px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap
                ${activeTab === 'descricao' 
                  ? 'border-b-2 border-primary text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'}`}
            >
              Descrição
            </button>
            <button 
              onClick={() => setActiveTab('especificacoes')}
              className={`px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap
                ${activeTab === 'especificacoes' 
                  ? 'border-b-2 border-primary text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'}`}
            >
              Especificações
            </button>
            <button 
              onClick={() => setActiveTab('avaliacoes')}
              className={`px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap
                ${activeTab === 'avaliacoes' 
                  ? 'border-b-2 border-primary text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'}`}
            >
              Avaliações ({product.avaliacoes_count || 0})
            </button>
            <button 
              onClick={() => setActiveTab('vendedor')}
              className={`px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap
                ${activeTab === 'vendedor' 
                  ? 'border-b-2 border-primary text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'}`}
            >
              Sobre o Vendedor
            </button>
          </div>
          
          <div className="p-6">
            {activeTab === 'descricao' && (
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-4">Descrição do Produto</h3>
                <div className="whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">
                  {product.descricao}
                </div>
              </div>
            )}
            
            {activeTab === 'especificacoes' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Especificações Técnicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Dimensões</h4>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Altura</span>
                        <span>{product.altura} cm</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Largura</span>
                        <span>{product.largura} cm</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Comprimento</span>
                        <span>{product.comprimento} cm</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Peso</span>
                        <span>{product.peso} kg</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Informações Gerais</h4>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Código</span>
                        <span>#{product.id}</span>
                      </li>
                      {product.categoria && (
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Categoria</span>
                          <span>{product.categoria.nome}</span>
                        </li>
                      )}
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Disponibilidade</span>
                        <span>{product.disponivel ? "Em estoque" : "Indisponível"}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Quantidade em Estoque</span>
                        <span>{product.estoque} unidades</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'avaliacoes' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Avaliações dos Clientes</h3>
                  <Button variant="outline" size="sm">Avaliar este produto</Button>
                </div>
                
                {product.avaliacoes_count > 0 ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-4 rounded-lg text-center">
                        <p className="text-4xl font-bold text-primary">{product.avaliacoes_media?.toFixed(1)}</p>
                        <div className="flex justify-center mt-1">
                          {renderStars(product.avaliacoes_media)}
                        </div>
                        <p className="text-sm mt-1 text-muted-foreground">
                          {product.avaliacoes_count} {product.avaliacoes_count === 1 ? 'avaliação' : 'avaliações'}
                        </p>
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-2">
                          Para ver todas as avaliações deste produto, clique no botão abaixo.
                        </p>
                        <Button variant="outline" size="sm">Ver todas as avaliações</Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground">Este produto ainda não possui avaliações.</p>
                    <p className="text-muted-foreground mt-2">Seja o primeiro a avaliar!</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'vendedor' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Informações sobre o Vendedor</h3>
                <div className="bg-muted/30 p-6 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center">
                      <Store className="h-8 w-8 text-primary" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium">{product.loja.nome_fantasia}</h4>
                      <p className="text-sm text-muted-foreground">
                        CNPJ: {product.loja.cnpj}
                      </p>
                    </div>
                  </div>
                  
                  {product.loja.descricao && (
                    <div className="mt-4 border-t pt-4">
                      <h5 className="font-medium mb-2">Sobre a Loja</h5>
                      <p className="text-sm text-muted-foreground">{product.loja.descricao}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" asChild>
                      <Link to={`/lojas/${product.loja_id}`}>Ver todos os produtos</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}