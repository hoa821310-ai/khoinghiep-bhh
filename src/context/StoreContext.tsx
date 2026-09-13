
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, Product, Order, OrderItem, PickupMethod, OrderStatus, RealtimeNotification, RealtimeConnectionStatus } from '../types';
import { getNextWorkingDay } from '../utils/dateUtils';
import { db, auth } from '../firebase';
import { collection, doc, onSnapshot, query, setDoc, updateDoc, deleteDoc, runTransaction, serverTimestamp, getDoc, getDocs, writeBatch, orderBy, where } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

interface StoreContextType {
  products: Product[];
  orders: Order[];
  currentUser: User | null;
  cart: Product[];
  sellerContactPhone: string;
  serverTime: number;
  isTimeSynced: boolean;
  realtimeStatus: RealtimeConnectionStatus;
  realtimeNotification: RealtimeNotification | null;
  dismissRealtimeNotification: () => void;
  loginBuyer: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  loginSeller: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  registerBuyer: (data: { name: string; className: string; phoneNumber: string; email: string; password: string; }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUserProfile: (data: { name: string; className: string; phoneNumber: string }) => void;
  updateSellerPhone: (phone: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'status' | 'createdBy'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addToCart: (product: Product) => { success: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  createOrder: (data: { pickupMethod: PickupMethod; pickupLocation: string; orderNotes?: string; overrideName?: string; overrideClass?: string; overridePhone?: string; }) => Promise<{ success: boolean; order?: Order; message?: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  getMarketplaceProducts: () => Product[];
  getUserOrders: (userId?: string) => Order[];
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cart, setCart] = useState<Product[]>([]);
  const [sellerContactPhone, setSellerContactPhone] = useState<string>('0974 900 849');
  
  const [clientLocalTime, setClientLocalTime] = useState<number>(Date.now());
  const [isTimeSynced, setIsTimeSynced] = useState<boolean>(true);
  
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeConnectionStatus>('connecting');
  const [realtimeNotification, setRealtimeNotification] = useState<RealtimeNotification | null>(null);

  // Sync server time locally
  useEffect(() => {
    const timer = setInterval(() => {
      setClientLocalTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dismissRealtimeNotification = useCallback(() => {
    setRealtimeNotification(null);
  }, []);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setCurrentUser(userDoc.data() as User);
        } else {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Realtime Firestore Listeners (Products)
  useEffect(() => {
    // Products Listener (Publicly accessible)
    const qProducts = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      setRealtimeStatus('connected');
      const prods: Product[] = [];
      snapshot.forEach(doc => prods.push(doc.data() as Product));
      setProducts(prods);
    }, (err) => {
      console.error("Products listen error:", err);
      setRealtimeStatus('disconnected');
    });

    return () => {
      unsubProducts();
    };
  }, []);

  // Realtime Firestore Listeners (Orders) - Requires Auth
  useEffect(() => {
    if (!currentUser) {
      setOrders([]);
      return;
    }

    let qOrders;
    if (currentUser.role === 'SELLER') {
      qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    } else {
      qOrders = query(collection(db, 'orders'), where('customerId', '==', currentUser.id));
    }

    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const ords: Order[] = [];
      snapshot.forEach(doc => ords.push(doc.data() as Order));
      
      if (currentUser.role === 'BUYER') {
        ords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      
      setOrders(ords);
    }, (err) => {
      console.error("Orders listen error:", err);
    });

    return () => {
      unsubOrders();
    };
  }, [currentUser]);

  const loginBuyer = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: 'Sai email hoặc mật khẩu.' };
    }
  };

  const registerBuyer = async (data: any) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const newUser: User = {
        id: cred.user.uid,
        name: data.name,
        email: data.email,
        className: data.className,
        phoneNumber: data.phoneNumber,
        role: 'BUYER',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', cred.user.uid), newUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: 'Lỗi đăng ký: ' + err.message };
    }
  };

  const loginSeller = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      if (!userDoc.exists() || userDoc.data()?.role !== 'SELLER') {
        await signOut(auth);
        return { success: false, message: 'Tài khoản này không có quyền Người bán (SELLER).' };
      }
      setCurrentUser(userDoc.data() as User);
      return { success: true };
    } catch (err: any) {
      console.error("Seller login error:", err);
      let errorMsg = 'Sai email hoặc mật khẩu nhà bán hàng.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMsg = 'Email hoặc mật khẩu nhà bán hàng không chính xác.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMsg = 'Quá nhiều lần thử thất bại. Vui lòng thử lại sau.';
      }
      return { success: false, message: errorMsg };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  const updateUserProfile = async (data: { name: string; className: string; phoneNumber: string }) => {
    if (currentUser) {
      const safeUpdates = {
        name: data.name.trim(),
        className: data.className.trim(),
        phoneNumber: data.phoneNumber.trim()
      };
      await updateDoc(doc(db, 'users', currentUser.id), safeUpdates);
      setCurrentUser({ ...currentUser, ...safeUpdates });
    }
  };

  const updateSellerPhone = (phone: string) => {
    setSellerContactPhone(phone);
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'status' | 'createdBy'>) => {
    const newDocRef = doc(collection(db, 'products'));
    const newProduct: Product = {
      ...productData,
      id: newDocRef.id,
      status: 'AVAILABLE',
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'CLB Khởi Nghiệp'
    };
    await setDoc(newDocRef, newProduct);
    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    await updateDoc(doc(db, 'products', id), updates);
  };

  const deleteProduct = async (id: string) => {
    if (!currentUser || currentUser.role !== 'SELLER') {
      throw new Error('Chỉ tài khoản Nhà bán hàng mới có quyền xóa sản phẩm.');
    }

    try {
      // Chỉ xóa sản phẩm, không xóa lịch sử đơn hàng
      await deleteDoc(doc(db, 'products', id));

      // 3. Clean up client cart state
      setCart(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      console.error('Delete product error:', err);
      throw err;
    }
  };

  const addToCart = (product: Product) => {
    const currentProd = products.find(p => p.id === product.id);
    if (!currentProd || currentProd.status === 'SOLD_OUT' || currentProd.status === 'HIDDEN') {
      return { success: false, message: 'Sản phẩm này đã được bán hoặc không khả dụng.' };
    }
    if (cart.some(p => p.id === product.id)) {
      return { success: false, message: 'Sản phẩm độc bản này đã có trong giỏ hàng của bạn.' };
    }
    setCart(prev => [...prev, currentProd]);
    return { success: true, message: 'Đã thêm sản phẩm vào giỏ hàng.' };
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(p => p.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const createOrder = async (data: any) => {
    if (!currentUser) return { success: false, message: 'Vui lòng đăng nhập.' };
    if (cart.length === 0) return { success: false, message: 'Giỏ hàng trống.' };

    const unreleasedInCart = cart.filter(c => {
      const liveProduct = products.find(p => p.id === c.id) || c;
      return liveProduct.openSaleTimestamp && liveProduct.openSaleTimestamp > clientLocalTime;
    });
    if (unreleasedInCart.length > 0) {
      return { success: false, message: `Sản phẩm chưa mở bán.` };
    }

    try {
      const newOrder = await runTransaction(db, async (transaction) => {
        // Read all products in cart
        const productDocs = await Promise.all(
          cart.map(item => transaction.get(doc(db, 'products', item.id)))
        );
        
        // Verify availability
        const unavailable: string[] = [];
        productDocs.forEach((pDoc) => {
          if (!pDoc.exists() || pDoc.data().status !== 'AVAILABLE') {
            unavailable.push(pDoc.data()?.name || pDoc.id);
          }
        });

        if (unavailable.length > 0) {
          throw new Error(`Sản phẩm ${unavailable.join(', ')} vừa được người khác đặt mua.`);
        }

        // Lock/update products to SOLD_OUT
        productDocs.forEach((pDoc) => {
          transaction.update(pDoc.ref, { 
            status: 'SOLD_OUT', 
            soldOutAt: Date.now() 
          });
        });

        const buyerName = (data.overrideName || currentUser.name).trim();
        const buyerClass = (data.overrideClass || currentUser.className).trim();
        const buyerPhone = (data.overridePhone || currentUser.phoneNumber).trim();
        const { fullDescription: expectedDate } = getNextWorkingDay(new Date());

        const orderItems: OrderItem[] = productDocs.map((pDoc) => {
          const p = pDoc.data() as Product;
          return {
            productId: p.id,
            productName: p.name,
            price: p.price,
            imageUrl: p.imageUrl || (p.images && p.images[0]) || '',
            deliveryPeriod: p.deliveryPeriod || (p.deliveryPeriods && p.deliveryPeriods[0]) || 'Ra chơi sáng'
          };
        });

        const totalAmount = orderItems.reduce((sum, item) => sum + item.price, 0);
        
        const newOrderRef = doc(collection(db, 'orders'));
        const orderData: Order = {
          id: newOrderRef.id,
          customerId: currentUser.id,
          customerName: buyerName,
          className: buyerClass,
          customerPhone: buyerPhone,
          pickupMethod: data.pickupMethod,
          pickupLocation: data.pickupLocation.trim(),
          orderNotes: data.orderNotes?.trim() || '',
          createdAt: new Date().toISOString(),
          expectedDeliveryDate: expectedDate,
          status: 'PENDING',
          total: totalAmount,
          items: orderItems
        };

        transaction.set(newOrderRef, orderData);
        return orderData;
      });

      setCart([]);
      return { success: true, order: newOrder };
    } catch (error: any) {
      return { success: false, message: error.message || 'Lỗi đặt hàng' };
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await updateDoc(doc(db, 'orders', orderId), { status });
  };

  const getMarketplaceProducts = () => products;
  const getUserOrders = (userId?: string) => {
    const targetId = userId || currentUser?.id;
    if (!targetId) return [];
    return orders.filter(o => o.customerId === targetId);
  };
  
  const refreshData = async () => {};

  return (
    <StoreContext.Provider value={{
      products, orders, currentUser, cart, sellerContactPhone, serverTime: clientLocalTime, isTimeSynced,
      realtimeStatus, realtimeNotification, dismissRealtimeNotification,
      loginBuyer, loginSeller, registerBuyer, logout,
      updateUserProfile, updateSellerPhone, addProduct, updateProduct, deleteProduct,
      addToCart, removeFromCart, clearCart, createOrder, updateOrderStatus,
      getMarketplaceProducts, getUserOrders, refreshData
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
