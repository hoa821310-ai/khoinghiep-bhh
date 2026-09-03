const fs = require('fs');

let code = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

// We need to split the useEffect for products and orders.
const oldRealtimeListeners = `  // Realtime Firestore Listeners
  useEffect(() => {
    setRealtimeStatus('connected');
    
    // Products Listener
    const qProducts = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach(doc => prods.push(doc.data() as Product));
      setProducts(prods);
    }, (err) => {
      console.error("Products listen error:", err);
      setRealtimeStatus('disconnected');
    });

    // Orders Listener
    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const ords: Order[] = [];
      snapshot.forEach(doc => ords.push(doc.data() as Order));
      setOrders(ords);
    }, (err) => {
      console.error("Orders listen error:", err);
    });

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, []);`;

const newRealtimeListeners = `  // Realtime Firestore Listeners (Products)
  useEffect(() => {
    setRealtimeStatus('connected');
    
    // Products Listener (Publicly accessible)
    const qProducts = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
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

    import('firebase/firestore').then(({ query, collection, onSnapshot, orderBy, where }) => {
      let qOrders;
      if (currentUser.role === 'SELLER') {
        qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      } else {
        // For BUYER, query only their orders to satisfy security rules. 
        // Avoid orderBy to prevent missing composite index errors on initial deployment.
        qOrders = query(collection(db, 'orders'), where('customerId', '==', currentUser.id));
      }

      const unsubOrders = onSnapshot(qOrders, (snapshot) => {
        const ords: Order[] = [];
        snapshot.forEach(doc => ords.push(doc.data() as Order));
        
        // If buyer, we sort locally to avoid index requirement
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
    });
  }, [currentUser]);`;

// Need to add "where" to firestore imports if not there.
code = code.replace(oldRealtimeListeners, newRealtimeListeners);
fs.writeFileSync('src/context/StoreContext.tsx', code);
