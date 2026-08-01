const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboard.tsx', 'utf8');
code = code.replace(
  /const \[metrics, setMetrics\] = useState<DashboardMetrics \| null>\(null\);\s*useEffect\(\(\) => \{\s*const unsubscribe = dashboardService\.subscribeToMetrics\(\(data\) => setMetrics\(data\)\);\s*return \(\) => unsubscribe\(\);\s*\}, \[\]\);/g,
  `const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const unsubscribe = dashboardService.subscribeToMetrics(
      (data) => {
        setMetrics(data);
        setError(null);
      },
      (err) => setError(err.message)
    );
    return () => unsubscribe();
  }, []);`
);
fs.writeFileSync('src/pages/dashboard.tsx', code);
