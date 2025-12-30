# $ELIXIR Tournament Platform

A Next.js-based tournament platform for Clash Royale tournaments powered by Solana and $ELIXIR token.

## Features

- 🎮 **Token-Gated Tournaments**: Compete in tournaments based on your $ELIXIR token holdings
- 💰 **Multi-Tier System**: Minnow, Squire, and Whale tiers with different prize pools
- 🔐 **Wallet Integration**: Connect with Phantom, Solflare, and other Solana wallets
- 📊 **Live Dashboard**: Track your balance, tier, and tournament eligibility
- 🏆 **Tournament Monitor**: View registered players and tournament status
- 📅 **Biweekly Tournaments**: Regular tournaments on Wednesdays and Saturdays

## Tech Stack

- **Framework**: Next.js 14
- **Blockchain**: Solana
- **Database**: Supabase
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Fonts**: Geist Sans, Inter

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Solana wallet (Phantom, Solflare, etc.)
- Supabase account
- Clash Royale API token (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd ClashRoyale
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
NEXT_PUBLIC_TOKEN_MINT_ADDRESS=YOUR_TOKEN_ADDRESS
NEXT_PUBLIC_RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_CLASH_ROYALE_API_TOKEN=your-api-token
```

4. Set up Supabase:
   - Follow instructions in `SUPABASE_SETUP.md`
   - Run the SQL scripts in `SUPABASE_TOURNAMENT_CONFIG.sql`

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main entry point
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   └── rules/             # Tournament rules page
├── components/            # React components
│   ├── Dashboard.tsx     # User dashboard
│   ├── Overview.tsx      # Landing page
│   ├── TournamentMonitor.tsx
│   └── ...
├── lib/                   # Utilities and hooks
│   ├── constants.ts      # App constants
│   ├── supabase.ts       # Supabase client
│   ├── useTokenBalance.ts
│   └── ...
└── public/               # Static assets
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_TOKEN_MINT_ADDRESS` | Your $ELIXIR token contract address | Yes |
| `NEXT_PUBLIC_RPC_ENDPOINT` | Solana RPC endpoint (Helius recommended) | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `NEXT_PUBLIC_CLASH_ROYALE_API_TOKEN` | Clash Royale API token | Optional |

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

## Tournament Tiers

- **Minnow**: 0 tokens (view only)
- **Squire**: 500,000+ tokens
- **Whale**: 2,500,000+ tokens
- **TGE**: 500,000+ tokens (special tournament)

## Tournament Schedule

- **Regular Tournaments**: Biweekly on Wednesdays and Saturdays
- **Preparation Phase**: 3:00 PM UTC (1 hour)
- **Tournament Start**: 4:00 PM UTC
- **Tournament End**: 8:00 PM UTC
- **Elimination**: 3 losses = out
- **Prize Distribution**: 1st (75%), 2nd (20%), 3rd (5%)

## License

Private - All rights reserved

## Support

For issues or questions, please check the documentation files:
- `SUPABASE_SETUP.md` - Database setup
- `SUPABASE_TROUBLESHOOTING.md` - Common issues
- `DEPLOYMENT.md` - Deployment guide

