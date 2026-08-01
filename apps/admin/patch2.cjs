const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboard.tsx', 'utf8');
code = code.replace(
  "  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);\n  useEffect(() => {\n    const unsubscribe = dashboardService.subscribeToMetrics((data) => setMetrics(data));\n    return () => unsubscribe();\n  }, []);",
  `  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);\n  const [error, setError] = useState<string | null>(null);\n  useEffect(() => {\n    const unsubscribe = dashboardService.subscribeToMetrics(\n      (data) => {\n        setMetrics(data);\n        setError(null);\n      },\n      (err) => setError(err.message)\n    );\n    return () => unsubscribe();\n  }, []);`
);
fs.writeFileSync('src/pages/dashboard.tsx', code);
