require('dotenv').config();
const bcrypt = require('bcryptjs');
const { collection } = require('./jsonDB');

const seed = async () => {
  const Users = collection('users');
  const exists = Users.findOne({ email: 'admin@example.com' });
  if (!exists) {
    const hashed = await bcrypt.hash('admin123', 12);
    Users.create({ name: 'Admin User', email: 'admin@example.com', password: hashed, companyName: 'Shree Enterprises', role: 'admin' });
    console.log('✅ Demo admin created!');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
  } else {
    console.log('⚠️  Admin already exists. Email: admin@example.com / Password: admin123');
  }
};

seed().catch(console.error);
