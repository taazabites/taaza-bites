const fs = require('fs');
let code = fs.readFileSync('src/pages/Orders.tsx', 'utf-8');

// Find the precise order query block
code = code.replace(/const qOrders = query\(\s*collection\(db, 'orders'\),\s*where\('userId', '==', currentUser\.uid\)\s*\);/g, 
`const qOrders = query(
        collection(db, 'orders'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(20)
      );`);

// Make sure imports are correct
if (!code.includes('orderBy,')) {
    code = code.replace(/where,/g, 'where, orderBy, limit,');
}

// Remove the client-side sorting since it's already sorted
code = code.replace(/list\.sort\(\(a, b\) => \(b\.createdAt\?\.seconds \|\| 0\) - \(a\.createdAt\?\.seconds \|\| 0\)\);/g, '');

fs.writeFileSync('src/pages/Orders.tsx', code);
