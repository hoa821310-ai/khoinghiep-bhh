const fs = require('fs');

let code = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

// Ensure where is imported
if (!code.includes("where } from 'firebase/firestore'")) {
  code = code.replace("orderBy } from 'firebase/firestore';", "orderBy, where } from 'firebase/firestore';");
}

const badDynamicImport = `    import('firebase/firestore').then(({ query, collection, onSnapshot, orderBy, where }) => {
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
    });`;

const properUseEffect = `    let qOrders;
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
    };`;

code = code.replace(badDynamicImport, properUseEffect);

fs.writeFileSync('src/context/StoreContext.tsx', code);
