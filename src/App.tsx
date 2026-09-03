import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Product, Order } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { CustomerDashboard } from './components/CustomerDashboard';
import { ProducerDashboard } from './components/ProducerDashboard';
import { ProductFormModal } from './components/ProductFormModal';
import { ClubStory } from './components/ClubStory';
import { HowItWorks } from './components/HowItWorks';
import { Footer } from './components/Footer';
import { RealtimeToast } from './components/RealtimeToast';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const MainApp: React.FC = () => {
  const {
    getMarketplaceProducts,
    addToCart,
    currentUser,
    cart
  } = useStore();

  // Navigation View: 'home' | 'products' | 'story' | 'guide' | 'orders' | 'profile' | 'seller-dashboard'
  const [currentView, setCurrentView] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'buyer-login' | 'buyer-register' | 'seller-login'>('buyer-login');
  const [authNotice, setAuthNotice] = useState('');
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleAddToCart = (product: Product) => {
    const res = addToCart(product);
    if (res.success) {
      showToast('Đã thêm sản phẩm độc bản vào giỏ hàng!', 'success');
    } else {
      showToast(res.message || 'Không thể thêm sản phẩm.', 'error');
    }
  };

  const handleProceedToCheckout = () => {
    if (!currentUser) {
      setAuthNotice('Vui lòng đăng ký hoặc đăng nhập trước khi đặt hàng.');
      setAuthMode('buyer-login');
      setIsAuthOpen(true);
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleOpenAddProduct = () => {
    setProductToEdit(null);
    setIsProductFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setIsProductFormOpen(true);
  };

  const handleOpenSellerLogin = () => {
    setAuthMode('seller-login');
    setAuthNotice('');
    setIsAuthOpen(true);
  };

  const marketplaceProducts = getMarketplaceProducts();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F1DF] text-[#283124] selection:bg-[#C7DCAE]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs sm:text-sm font-bold ${
              toastMessage.type === 'success'
                ? 'bg-[#405B32] text-white border-[#6C9A4A]'
                : 'bg-[#A03045] text-white border-[#F7B7C4]'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#C7DCAE]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#F7B7C4]" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        openAuthModal={() => {
          setAuthMode('buyer-login');
          setAuthNotice('');
          setIsAuthOpen(true);
        }}
        openCartDrawer={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content Area based on current view */}
      <main className="flex-1">
        
        {/* VIEW: HOME */}
        {currentView === 'home' && (
          <div>
            <Hero
              onExplore={() => {
                const element = document.getElementById('products-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                } else {
                  setCurrentView('products');
                }
              }}
              onAbout={() => setCurrentView('story')}
            />

            <ProductGrid
              products={marketplaceProducts}
              onSelectProduct={setSelectedProduct}
              onAddToCart={handleAddToCart}
              searchQuery={searchQuery}
              onOpenAddProductModal={handleOpenAddProduct}
              onEditProduct={handleEditProduct}
            />

            <ClubStory />

            <HowItWorks />
          </div>
        )}

        {/* VIEW: PRODUCTS */}
        {currentView === 'products' && (
          <div className="pt-4">
            <ProductGrid
              products={marketplaceProducts}
              onSelectProduct={setSelectedProduct}
              onAddToCart={handleAddToCart}
              searchQuery={searchQuery}
              onOpenAddProductModal={handleOpenAddProduct}
              onEditProduct={handleEditProduct}
            />
          </div>
        )}

        {/* VIEW: STORY */}
        {currentView === 'story' && (
          <div className="pt-4">
            <ClubStory />
            <HowItWorks />
          </div>
        )}

        {/* VIEW: GUIDE */}
        {currentView === 'guide' && (
          <div className="pt-4">
            <HowItWorks />
            <ClubStory />
          </div>
        )}

        {/* VIEW: CUSTOMER ORDERS / HISTORY */}
        {(currentView === 'orders' || currentView === 'profile') && (
          <CustomerDashboard
            onExploreProducts={() => setCurrentView('products')}
          />
        )}

        {/* VIEW: SELLER / CLB DASHBOARD */}
        {currentView === 'seller-dashboard' && (
          <ProducerDashboard
            onOpenAddProductModal={handleOpenAddProduct}
            onEditProduct={handleEditProduct}
          />
        )}

      </main>

      {/* Footer */}
      <Footer
        onNavClick={setCurrentView}
        onOpenSellerLogin={handleOpenSellerLogin}
      />

      {/* Modals & Drawers */}
      
      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onEditProduct={handleEditProduct}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(order) => {
          showToast(`Đặt hàng thành công đơn hàng cho ${order.customerName}!`, 'success');
        }}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        customNotice={authNotice}
        onSuccess={() => {
          if (authNotice) {
            setIsCheckoutOpen(true);
          }
        }}
      />

      {/* Realtime Order & Status Toast Notification */}
      <RealtimeToast onNavigateToView={setCurrentView} />

      {/* Product Create / Edit Modal (Seller only) */}
      <ProductFormModal
        isOpen={isProductFormOpen}
        onClose={() => {
          setIsProductFormOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
      />

    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}
