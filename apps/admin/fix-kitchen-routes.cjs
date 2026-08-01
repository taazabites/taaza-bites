const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('KitchenPackingPage')) {
  // Insert lazy imports
  code = code.replace(
    /const KitchenPage = lazy\(\(\) => import\("\.\/pages\/kitchen"\)\)/,
    `const KitchenPage = lazy(() => import("./pages/kitchen"));\nconst KitchenPackingPage = lazy(() => import("./pages/kitchen-packing"));`
  );
  
  // Insert routes
  code = code.replace(
    /<Route path="\/kitchen" element=\{<KitchenPage \/>\} \/>/,
    `<Route path="/kitchen" element={<KitchenPage />} />\n                  <Route path="/kitchen/packing" element={<KitchenPackingPage />} />`
  );
  
  fs.writeFileSync('src/App.tsx', code);
}
