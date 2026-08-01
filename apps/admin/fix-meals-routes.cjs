const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('MealsCategoriesPage')) {
  // Insert lazy imports
  code = code.replace(
    /const MealsPage = lazy\(\(\) => import\("\.\/pages\/meals"\)\)/,
    `const MealsPage = lazy(() => import("./pages/meals"));
const MealsCategoriesPage = lazy(() => import("./pages/meals-categories"));
const MealsPricingPage = lazy(() => import("./pages/meals-pricing"));
const MealsAvailabilityPage = lazy(() => import("./pages/meals-availability"));`
  );
  
  // Insert routes
  code = code.replace(
    /<Route path="\/meals" element=\{<MealsPage \/>\} \/>/,
    `<Route path="/meals" element={<MealsPage />} />
                  <Route path="/meals/categories" element={<MealsCategoriesPage />} />
                  <Route path="/meals/pricing" element={<MealsPricingPage />} />
                  <Route path="/meals/availability" element={<MealsAvailabilityPage />} />`
  );
  
  fs.writeFileSync('src/App.tsx', code);
}
