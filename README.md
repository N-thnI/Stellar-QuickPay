# ⚡ Stellar QuickPay: Obsidian Edition

A high-performance, premium-tier Stellar dApp built for the **White Belt (Level 1)** Challenge. This application combines a luxury FinTech aesthetic with robust blockchain engineering.

## 🏆 Key Features
- **Luxury UI/UX**: Custom Obsidian, Gold, and Silver palette with high-contrast interactive elements.
- **Dynamic Onboarding**: Integrated Friendbot funding flow for new Testnet accounts.
- **Production-Grade Error Handling**: Human-readable translations for Horizon error codes (e.g., underfunded, invalid destination).
- **Network Guard**: Real-time detection of Freighter network mismatches to prevent signature failures.

## 🛠️ Technical Implementation
- **Frontend**: React + Vite + Tailwind CSS
- **SDKs**: `@stellar/stellar-sdk`, `@stellar/freighter-api`
- **Validation**: Strict public key verification and pre-flight balance checks.

## 📸 Proof of Work

### Dashboard
![Dashboard](./media/Connect-wallet.png)

### Onboarding & Funding
![Onboarding](./media/Transaction.png)

### Transaction Success
![Transaction Success](./media/Successful.png)

## 🚀 Installation & Setup
1. **Clone**: `git clone https://github.com/N-thnI/Stellar-QuickPay`
2. **Install**: `npm install`
3. **Run**: `npm run dev`
4. **Note**: Ensure Freighter is set to **Testnet** via Settings > Network.