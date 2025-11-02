const { ethers } = require('ethers');

// Generate a new wallet for the backend
const wallet = ethers.Wallet.createRandom();

console.log('🔑 Generated Backend Wallet:');
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
console.log('');
console.log('📋 Add this to your .env file:');
console.log(`BACKEND_PRIVATE_KEY=${wallet.privateKey}`);
console.log('');
console.log('⚠️  IMPORTANT: Keep this private key secure and never commit it to version control!');
console.log('💰 You may need to fund this wallet with testnet tokens for gas fees.');
