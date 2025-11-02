# HashMon - Pokémon Mini-Game on Pharos Network

HashMon is an innovative blockchain-based Pokémon mini-game built on the Pharos Network, featuring strategic battles, NFT collection, and Web3 integration. Players can battle AI opponents, level up their HashMons, and mint unique NFTs as rewards.

## 🎮 Features

- **Epic Battles**: Strategic turn-based combat with type advantages
- **HashMon Collection**: Collect and train unique HashMon creatures
- **NFT Rewards**: Mint HashMon NFTs as battle rewards
- **Level System**: Gain XP and level up your HashMons
- **Leaderboards**: Compete with other players globally
- **Web3 Integration**: Built on Pharos Network with wallet connectivity
- **Real-time Stats**: Track battles and achievements on-chain

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git
- MetaMask wallet
- Supabase account (for database)
- Pharos testnet tokens

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/hashmon.git
   cd hashmon
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd contracts && npm install
   cd ../backend && npm install
   cd ../frontend && npm install
   ```

3. **Set up environment variables**
   
   **Backend** (`backend/.env`):
   ```env
   PORT=3001
   NODE_ENV=development
   
   # Blockchain Configuration
   PHAROS_RPC_URL=https://testnet.dplabs-internal.com
   BACKEND_PRIVATE_KEY=your_backend_wallet_private_key
   HASHMON_CONTRACT_ADDRESS=deployed_contract_address
   
   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Security
   JWT_SECRET=your_jwt_secret
   VOUCHER_EXPIRY_HOURS=24
   ```

   **Frontend** (`frontend/.env`):
   ```env
   VITE_API_URL=http://localhost:3001/api
   VITE_HASHMON_CONTRACT_ADDRESS=deployed_contract_address
   ```

4. **Set up Supabase Database**
   - Create a new Supabase project
   - Run the SQL schema from `backend/supabase/schema.sql`
   - Get your project URL and API keys

5. **Deploy Smart Contracts**
   ```bash
   cd contracts
   # Set your private key
   npx hardhat vars set PRIVATE_KEY
   # Deploy to Pharos testnet
   npm run deploy:pharos
   ```

6. **Start the development servers**
   ```bash
   # From the root directory
   npm run dev
   ```

## 🏗️ Architecture

### Smart Contracts
- **HashMon.sol**: ERC-721 NFT contract with battle logging
- **Voucher System**: Secure minting with backend-signed vouchers
- **Battle Logging**: On-chain battle results for TPS demonstration

### Backend Services
- **Battle Engine**: Deterministic battle logic with AI opponents
- **Voucher Service**: EIP-712 signed mint vouchers
- **Blockchain Service**: Contract interaction and transaction management
- **Player Service**: Supabase integration for off-chain data

### Frontend
- **React + Vite**: Modern React application
- **Phaser.js**: 2D game engine for battle animations
- **Ethers.js**: Blockchain interaction
- **Framer Motion**: Smooth animations and transitions

## 🎯 Gameplay

### Battle System
1. **Select HashMon**: Choose from your collection
2. **Choose Difficulty**: 1-10 difficulty levels
3. **Strategic Combat**: Turn-based battles with type advantages
4. **Move Selection**: Choose from 4 different moves
5. **XP & Leveling**: Gain experience and level up
6. **NFT Rewards**: Mint NFTs for special achievements

### HashMon Types
- **Fire** 🔥: Strong against Grass, weak to Water
- **Water** 💧: Strong against Fire, weak to Electric
- **Grass** 🌿: Strong against Water, weak to Fire
- **Electric** ⚡: Strong against Water, weak to Ground
- **Psychic** 🔮: Strong against Fighting, weak to Dark
- **Fighting** 👊: Strong against Normal, weak to Psychic
- **Dark** 🌑: Strong against Psychic, weak to Fighting
- **Steel** ⚔️: High defense, weak to Fire

## 🔧 Development

### Project Structure
```
hashmon/
├── contracts/          # Smart contracts (Hardhat)
├── backend/           # Node.js API server
├── frontend/          # React application
├── docs/             # Documentation
└── README.md
```

### Available Scripts

**Root level:**
- `npm run dev`: Start all development servers
- `npm run build`: Build all projects
- `npm run test`: Run contract tests

**Contracts:**
- `npm run compile`: Compile smart contracts
- `npm run deploy:pharos`: Deploy to Pharos testnet
- `npm run test`: Run contract tests

**Backend:**
- `npm run dev`: Start development server
- `npm start`: Start production server

**Frontend:**
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

## 🌐 Network Configuration

### Pharos Testnet
- **Chain ID**: 688688
- **RPC URL**: https://testnet.dplabs-internal.com
- **Explorer**: https://testnet.pharosscan.xyz
- **Currency**: PHAR

### Pharos Atlantic Testnet
- **Chain ID**: 688689
- **RPC URL**: https://atlantic.dplabs-internal.com
- **Explorer**: https://pharos-atlantic-testnet.socialscan.io
- **Currency**: PHAR

## 📊 TPS Demonstration

HashMon showcases Pharos Network's high TPS capabilities through:

1. **Battle Logging**: Each battle result is logged on-chain
2. **Parallel Processing**: Multiple battles can be processed simultaneously
3. **Gas Efficiency**: Optimized smart contracts for minimal gas usage
4. **Real-time Stats**: Live blockchain statistics in the UI

## 🚀 Deployment

### Vercel Deployment (Recommended)

We provide detailed guides for deploying to Vercel:

- **Quick Start**: See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for fastest deployment
- **Full Guide**: See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for complete instructions

**Recommended Approach**: Deploy frontend and backend as separate Vercel projects for better isolation and scaling.

### Production Deployment

1. **Deploy Smart Contracts**
   ```bash
   cd contracts
   npx hardhat ignition deploy ./ignition/modules/HashMon.js --network pharos
   ```

2. **Deploy Backend**
   - Use Vercel (see deployment guides above)
   - Or use services like Render, Railway, or AWS
   - Set environment variables
   - Ensure Supabase is configured

3. **Deploy Frontend**
   - Use Vercel (see deployment guides above)
   - Or use Netlify or similar
   - Set environment variables
   - Update API URLs

### Environment Variables

**Production Backend:**
```env
NODE_ENV=production
PORT=3001
PHAROS_RPC_URL=https://testnet.dplabs-internal.com
BACKEND_PRIVATE_KEY=your_production_private_key
HASHMON_CONTRACT_ADDRESS=deployed_contract_address
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Production Frontend:**
```env
VITE_API_URL=https://your-api-domain.com/api
VITE_HASHMON_CONTRACT_ADDRESS=deployed_contract_address
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Pharos Network** for providing the blockchain infrastructure
- **OpenZeppelin** for secure smart contract libraries
- **Phaser.js** for the game engine
- **Supabase** for the backend-as-a-service platform
- **React** and **Vite** for the frontend framework

## 📞 Support

- **Discord**: Join our [Pharos Discord](https://discord.gg/pharos)
- **Documentation**: [Pharos Docs](https://docs.pharosnetwork.xyz)
- **Issues**: [GitHub Issues](https://github.com/your-username/hashmon/issues)

## 🎉 Roadmap

- [ ] Multiplayer battles
- [ ] HashMon breeding system
- [ ] Guild/Team features
- [ ] Mobile app
- [ ] Advanced AI opponents
- [ ] Seasonal events
- [ ] Cross-chain integration

---

**Built with ❤️ on Pharos Network**

*Experience the future of gaming with Web3 technology!*

