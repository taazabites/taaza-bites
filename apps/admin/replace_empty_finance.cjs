const fs = require('fs');
let code = fs.readFileSync('src/pages/finance.tsx', 'utf-8');

// Add EmptyState import if missing
if (!code.includes('EmptyState')) {
  code = code.replace(
    'import { Button } from "@/components/ui/button"',
    'import { Button } from "@/components/ui/button"\nimport { EmptyState } from "@/components/ui/empty-state"'
  );
}

const oldBlock = `<div className="text-center py-24 text-zinc-500 flex flex-col items-center justify-center">
              <Receipt className="h-14 w-14 text-zinc-800 mb-4" />
              <p className="font-semibold text-lg text-zinc-300">No matching payments found</p>
              <p className="text-sm text-zinc-500 max-w-sm mt-1">Adjust your filter options or simulate a new completed payment transaction.</p>
            </div>`;

const newBlock = `<EmptyState
              icon="inbox"
              title="No matching payments found"
              description="Adjust your filter options or simulate a new completed payment transaction."
            />`;

code = code.replace(oldBlock, newBlock);
fs.writeFileSync('src/pages/finance.tsx', code);
console.log('Replaced');
