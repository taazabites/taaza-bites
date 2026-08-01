const fs = require('fs');

let code = fs.readFileSync('src/pages/orders.tsx', 'utf8');

if (!code.includes('useLocation')) {
  code = code.replace(/import \{ useAuth \} from "\.\.\/contexts\/auth-context"/, 
  `import { useAuth } from "../contexts/auth-context"\nimport { useLocation } from "react-router-dom"`);
}

code = code.replace(/export default function OrdersPage\(\) \{/, 
  `export default function OrdersPage() {
  const location = useLocation();
  const defaultStatus = location.pathname.includes('/orders/pending') ? 'Pending' :
                        location.pathname.includes('/orders/preparing') ? 'Preparing' :
                        location.pathname.includes('/orders/packed') ? 'Packed' :
                        location.pathname.includes('/orders/delivery') ? 'Out For Delivery' :
                        location.pathname.includes('/orders/delivered') ? 'Delivered' :
                        location.pathname.includes('/orders/cancelled') ? 'Cancelled' : 'All';
`);

code = code.replace(/const \[statusFilter, setStatusFilter\] = useState<string>\("All"\)/, 
  `const [statusFilter, setStatusFilter] = useState<string>(defaultStatus);
  
  useEffect(() => {
    setStatusFilter(defaultStatus);
  }, [defaultStatus]);`);

fs.writeFileSync('src/pages/orders.tsx', code);
