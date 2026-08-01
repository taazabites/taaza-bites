const fs = require('fs');

let code = fs.readFileSync('src/pages/orders.tsx', 'utf8');

// Add pagination state
if (!code.includes('currentPage')) {
  code = code.replace(/const \[statusFilter, setStatusFilter\] = useState<string>\(defaultStatus\);/,
    `const [statusFilter, setStatusFilter] = useState<string>(defaultStatus);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;`);
  
  // Replace the showing text
  code = code.replace(
    /Showing <strong className="text-zinc-300">\{filteredOrders\.length\}<\/strong> of \{orders\.length\} orders/,
    `Showing <strong className="text-zinc-300">{Math.min(filteredOrders.length, itemsPerPage)}</strong> of {filteredOrders.length} orders`
  );
  
  // Replace table body mapping
  code = code.replace(
    /\{filteredOrders\.map\(\(order\) => \(/,
    `{filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((order) => (`
  );
  
  // Add pagination controls
  code = code.replace(
    /<\/CardContent>\s*<\/Card>/,
    `  <div className="flex items-center justify-between p-4 border-t border-zinc-800/60 bg-zinc-900/20">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-zinc-800 text-zinc-400"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-zinc-800 text-zinc-400"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage * itemsPerPage >= filteredOrders.length}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>`
  );
  fs.writeFileSync('src/pages/orders.tsx', code);
}
