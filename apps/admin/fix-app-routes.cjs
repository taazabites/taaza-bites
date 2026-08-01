const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('<Route path="/orders/pending" element={<OrdersPage />} />')) {
  code = code.replace(
    /<Route path="\/orders" element=\{<OrdersPage \/>\} \/>/,
    `<Route path="/orders" element={<OrdersPage />} />
                  <Route path="/orders/pending" element={<OrdersPage />} />
                  <Route path="/orders/preparing" element={<OrdersPage />} />
                  <Route path="/orders/packed" element={<OrdersPage />} />
                  <Route path="/orders/delivery" element={<OrdersPage />} />
                  <Route path="/orders/delivered" element={<OrdersPage />} />
                  <Route path="/orders/cancelled" element={<OrdersPage />} />`
  );
  fs.writeFileSync('src/App.tsx', code);
}
