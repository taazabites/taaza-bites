const fs = require('fs');
let code = fs.readFileSync('src/pages/customers.tsx', 'utf-8');

// Add EmptyState import if missing
if (!code.includes('EmptyState')) {
  code = code.replace(
    'import { Button } from "@/components/ui/button"',
    'import { Button } from "@/components/ui/button"\nimport { EmptyState } from "@/components/ui/empty-state"'
  );
}

const oldBlock = `<div className="text-center py-24 text-zinc-500">
              No customers found.
            </div>`;

const newBlock = `<EmptyState
              icon="search"
              title="No customers found"
              description="Try adjusting your filters or search terms."
            />`;

code = code.replace(oldBlock, newBlock);
fs.writeFileSync('src/pages/customers.tsx', code);
console.log('Replaced');
