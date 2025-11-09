#!/usr/bin/env node

/**
 * Create a user account for MarkItUp
 * This is a temporary helper until the frontend signup UI is built
 *
 * Usage: node scripts/create-user.js
 */

import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🔐 MarkItUp - Create User Account\n');

  const email = await question('Email: ');
  const password = await question(
    'Password (min 8 chars, must include uppercase, lowercase, number): '
  );
  const name = await question('Name (optional): ');

  console.log('\n📝 Creating user account...');

  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        name: name || undefined,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ User account created successfully!');
      console.log(`📧 Email: ${email}`);
      console.log(`🆔 User ID: ${data.userId}`);
      console.log('\n📌 Next steps:');
      console.log('   1. Restart your dev server (npm run dev)');
      console.log('   2. You can now use the /api/auth/login endpoint');
      console.log('\n💡 To test login, run:');
      console.log(`   curl -X POST http://localhost:3000/api/auth/login \\`);
      console.log(`     -H "Content-Type: application/json" \\`);
      console.log(`     -d '{"email":"${email}","password":"YOUR_PASSWORD"}'`);
    } else {
      console.error('\n❌ Failed to create user account:');
      console.error(`   ${data.error || 'Unknown error'}`);
      if (data.details) {
        console.error(`   Details: ${JSON.stringify(data.details, null, 2)}`);
      }
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error creating user:');
    console.error(error.message);
    console.error('\n💡 Make sure your dev server is running: npm run dev');
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
