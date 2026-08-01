import axios from 'axios';
const API_URL = process.env.APP_URL || 'http://localhost:3000';
async function run() {
  await axios.post(`${API_URL}/api/cron/daily-orders`);
}
run();
