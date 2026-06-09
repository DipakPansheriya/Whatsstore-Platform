const bcrypt = require('bcryptjs');
const hash = '$2b$12$tIyXQ2CO2P3p9Gw9MQ4S/OCeP3iCDbfIkt4l4IE1UQ/yG39uAApzK';

const common = ['123456', 'deep123', 'deep@123', 'deep', 'password', 'Password123!', '12345678', 'admin', 'admin123'];
for (const p of common) {
  if (bcrypt.compareSync(p, hash)) {
    console.log('Match found:', p);
    process.exit(0);
  }
}
console.log('No match found');
