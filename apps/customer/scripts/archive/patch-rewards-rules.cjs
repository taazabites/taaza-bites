const fs = require('fs');

let pageCode = fs.readFileSync('src/pages/Rewards.tsx', 'utf8');

pageCode = pageCode.replace(
  '<h4 className="text-lg font-black text-zinc-900">Earning Rules</h4>',
  '<h4 className="text-lg font-black text-zinc-900">Points & Rules</h4>'
);

const additionalRules = `                   <div className="pt-4 mt-4 border-t border-amber-200/50 space-y-3">                     <div className="flex justify-between text-xs font-bold text-emerald-700">                        <span>Redeem 500 Points</span>                        <span>₹50 Wallet Credit</span>                     </div>                   </div>`;

pageCode = pageCode.replace(
  '                   <div className="flex justify-between text-xs font-bold text-amber-900">\n                      <span>First Subscription</span>\n                      <span>50 Points</span>\n                   </div>\n                </div>',
  '                   <div className="flex justify-between text-xs font-bold text-amber-900">\n                      <span>First Subscription</span>\n                      <span>50 Points</span>\n                   </div>\n' + additionalRules + '\n                </div>'
);

fs.writeFileSync('src/pages/Rewards.tsx', pageCode);
console.log('Patched Rewards.tsx rules');
