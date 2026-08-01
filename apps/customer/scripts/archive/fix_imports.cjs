const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

code = code.replace(/import \{ \n  doc, \n  onSnapshot, \n  collection, \n  query, \n  where, \n  orderBy, \n  limit, \n  updateDoc, \n  serverTimestamp \n\} from "firebase\/firestore";/, 
`import { 
  doc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  updateDoc, 
  serverTimestamp,
  getDoc,
  getDocs
} from "firebase/firestore";`);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
