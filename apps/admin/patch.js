const fs = require('fs');
let code = fs.readFileSync('src/services/dashboard.ts', 'utf8');
code = code.replace(
  "    callback(mockData);\n    \n    return () => {};",
  `    try {
      const q = query(collection(db, 'orders'), limit(1));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
            mockData.todaysOrders += snapshot.size;
        }
        callback(mockData);
      }, (error) => {
        console.error("Dashboard Firestore Error:", error);
        if (onError) onError(error);
        callback(mockData);
      });
      return () => unsubscribe();
    } catch (err) {
      if (onError && err instanceof Error) onError(err);
      return () => {};
    }`
);
fs.writeFileSync('src/services/dashboard.ts', code);
