require('dotenv').config();
const { collection } = require('./jsonDB');

const seed = async () => {
  const Users = collection('users');
  const exists = Users.findOne({ email: 'admin@gmail.com' });
  if (!exists) {
    Users.create({ name: 'Admin User', email: 'admin@gmail.com', password: 'admin123', companyName: 'Shree Enterprises', role: 'admin' });
    console.log('✅ Demo admin created!');
    console.log('   Email: admin@gmail.com');
    console.log('   Password: admin123');
  } else {
    console.log('⚠️  Admin already exists. Email: admin@gmail.com / Password: admin123');
  }
};

seed().catch(console.error);
