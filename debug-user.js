const { PrismaClient } = require('./src/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log('Checking user database...');
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: 'user@example.com' }
    });
    
    if (!user) {
      console.log('❌ USER NOT FOUND: user@example.com does not exist in database');
      
      // Check what users exist
      const allUsers = await prisma.user.findMany({
        select: { email: true, role: true }
      });
      console.log('Existing users:', allUsers);
      
      return;
    }
    
    console.log('✅ USER FOUND:', user.email, 'Role:', user.role);
    
    // Test password
    const passwordMatch = await bcrypt.compare('User123@', user.password);
    console.log('Password match:', passwordMatch ? '✅ CORRECT' : '❌ WRONG');
    
    if (!passwordMatch) {
      console.log('User password hash:', user.password.substring(0, 20) + '...');
    }
    
  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();