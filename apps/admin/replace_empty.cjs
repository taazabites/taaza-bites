const fs = require('fs');
let code = fs.readFileSync('src/pages/orders.tsx', 'utf-8');

const oldBlock = `<div className="flex flex-col items-center justify-center py-20 text-zinc-500 space-y-4">
            <Inbox className="h-12 w-12 text-zinc-700" />
            <div className="text-center">
              <p className="font-semibold text-zinc-400 text-lg">No orders found</p>
              <p className="text-sm text-zinc-600 mt-1">Try adjusting your filters or search terms.</p>
            </div>
            {orders.length === 0 && (
              <Button 
                onClick={handleSeedOrders}
                className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold mt-4"
              >
                Seed 10 Sample Orders
              </Button>
            )}
          </div>`;

const newBlock = `<EmptyState
            icon="search"
            title="No orders found"
            description="Try adjusting your filters or search terms. If you don't have any orders, you can seed sample data."
            action={
              orders.length === 0 && (
                <Button 
                  onClick={handleSeedOrders}
                  size="lg"
                  className="font-semibold shadow-md shadow-primary/20"
                >
                  Seed 10 Sample Orders
                </Button>
              )
            }
          />`;

code = code.replace(oldBlock, newBlock);
fs.writeFileSync('src/pages/orders.tsx', code);
console.log('Replaced');
