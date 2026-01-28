# Solana Escrow Smart Contract Setup Guide

Complete guide for deploying and using the Clash Royale Escrow program.

## 📋 Prerequisites

1. **Anchor Framework**: Install Anchor
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
   avm install latest
   avm use latest
   ```

2. **Solana CLI**: Install Solana CLI
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
   ```

3. **Node.js Dependencies**:
   ```bash
   npm install @coral-xyz/anchor @solana/web3.js
   ```

## 🏗️ Project Structure

```
programs/clash-royale-escrow/
├── src/
│   └── lib.rs              # Main program code
├── Anchor.toml             # Anchor configuration
└── Cargo.toml              # Rust dependencies

lib/solana/
├── wagerEscrow.ts          # Core client functions
├── wagerEscrowClient.ts    # React hooks for Next.js
└── idl/
    └── wager_escrow.ts     # TypeScript IDL
```

## 🔧 Configuration

### 1. Update Program ID

After building, update the program ID:

```bash
# Build the program
anchor build

# Get the program ID
solana address -k target/deploy/clash_royale_escrow-keypair.json

# Update in lib.rs
declare_id!("YOUR_PROGRAM_ID_HERE");
```

### 2. Set Platform Addresses

Update these constants in `lib/solana/wagerEscrow.ts`:

```typescript
// Your platform treasury address (receives 5% fees)
export const PLATFORM_TREASURY = new PublicKey(
  "YourPlatformTreasuryAddressHere111111111111111111111111"
);

// Your backend authority (Supabase service wallet)
export const BACKEND_AUTHORITY = new PublicKey(
  "YourBackendAuthorityAddressHere111111111111111111111111"
);
```

### 3. Generate Backend Authority Keypair

Create a keypair for your backend authority:

```bash
solana-keygen new -o backend-authority.json
solana address -k backend-authority.json
```

**⚠️ IMPORTANT**: Store this keypair securely! This is the only key that can resolve wagers.

## 🚀 Deployment

### Local Development

```bash
# Start local validator
solana-test-validator

# Build and deploy
anchor build
anchor deploy

# Run tests
anchor test
```

### Devnet Deployment

```bash
# Set cluster to devnet
solana config set --url devnet

# Airdrop SOL
solana airdrop 2

# Deploy
anchor build
anchor deploy --provider.cluster devnet
```

### Mainnet Deployment

```bash
# Set cluster to mainnet
solana config set --url mainnet-beta

# Deploy (requires SOL for rent)
anchor build
anchor deploy --provider.cluster mainnet-beta
```

## 📝 Usage Examples

### Create Wager (Frontend)

```typescript
import { useCreateWager } from "@/lib/solana/wagerEscrowClient";

function CreateWagerButton() {
  const { create, loading, error } = useCreateWager();
  const wagerId = 123; // From your database
  const amountSol = 1.0; // 1 SOL

  const handleCreate = async () => {
    const tx = await create(wagerId, amountSol);
    if (tx) {
      console.log("Wager created:", tx);
    }
  };

  return (
    <button onClick={handleCreate} disabled={loading}>
      {loading ? "Creating..." : "Create Wager"}
    </button>
  );
}
```

### Join Wager (Frontend)

```typescript
import { useJoinWager } from "@/lib/solana/wagerEscrowClient";

function JoinWagerButton({ creatorPubkey, wagerId }: Props) {
  const { join, loading, error } = useJoinWager();

  const handleJoin = async () => {
    const tx = await join(creatorPubkey, wagerId);
    if (tx) {
      console.log("Wager joined:", tx);
    }
  };

  return (
    <button onClick={handleJoin} disabled={loading}>
      {loading ? "Joining..." : "Join Wager"}
    </button>
  );
}
```

### Resolve Wager (Backend/Edge Function)

```typescript
import { resolveWager } from "@/lib/solana/wagerEscrow";
import { Connection, Keypair } from "@solana/web3.js";
import * as fs from "fs";

// In your Supabase Edge Function or API route
export async function resolveWagerHandler(
  creatorPubkey: string,
  wagerId: number,
  winnerPubkey: string
) {
  const connection = new Connection(RPC_ENDPOINT, "confirmed");
  
  // Load backend authority keypair (from environment variable)
  const backendAuthorityKeypair = Keypair.fromSecretKey(
    Buffer.from(process.env.BACKEND_AUTHORITY_SECRET_KEY!, "base64")
  );

  const creatorPubKey = new PublicKey(creatorPubkey);
  const winnerPubKey = new PublicKey(winnerPubkey);

  const tx = await resolveWager(
    connection,
    backendAuthorityKeypair,
    creatorPubKey,
    wagerId,
    winnerPubKey
  );

  return tx;
}
```

## 🔐 Security Considerations

1. **Backend Authority**: 
   - Store the backend authority keypair securely
   - Never expose it to the frontend
   - Use environment variables or secure key management

2. **Program Upgrades**:
   - The program is upgradeable by default
   - Consider making it immutable for production: `anchor build -- --features no-upgrade`

3. **Access Control**:
   - Only `resolveWager` checks for backend authority
   - `createWager` and `joinWager` are public (anyone can call)

4. **Fee Calculation**:
   - Platform fee is hardcoded to 5%
   - Consider making it configurable or using a separate fee account

## 🧪 Testing

### Unit Tests

Create `tests/clash-royale-escrow.ts`:

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ClashRoyaleEscrow } from "../target/types/clash_royale_escrow";
import { expect } from "chai";

describe("clash-royale-escrow", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.ClashRoyaleEscrow as Program<ClashRoyaleEscrow>;

  it("Creates a wager", async () => {
    // Test implementation
  });
});
```

## 📊 Integration with Supabase

### Update Edge Function

Modify `supabase/functions/resolve-wager/index.ts`:

```typescript
import { resolveWager } from "../../../lib/solana/wagerEscrow";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";

serve(async (req) => {
  const { wager_id, winner_wallet_address } = await req.json();
  
  // Get wager from database
  const { data: wager } = await supabase
    .from("wagers")
    .select("*")
    .eq("id", wager_id)
    .single();

  // Resolve on-chain
  const connection = new Connection(process.env.RPC_ENDPOINT!);
  const backendKeypair = Keypair.fromSecretKey(
    Buffer.from(process.env.BACKEND_AUTHORITY_SECRET_KEY!, "base64")
  );

  const tx = await resolveWager(
    connection,
    backendKeypair,
    new PublicKey(wager.creator_id),
    wager.id,
    new PublicKey(winner_wallet_address)
  );

  // Update database
  await supabase
    .from("wagers")
    .update({ 
      status: "COMPLETED",
      transaction_signature: tx 
    })
    .eq("id", wager_id);

  return new Response(JSON.stringify({ success: true, tx }));
});
```

## 🐛 Troubleshooting

### "Program account not found"
- Ensure program is deployed
- Check program ID matches in code

### "Insufficient funds"
- User needs SOL for transaction fees + wager amount
- Check account balance: `solana balance <address>`

### "Invalid signer"
- Backend authority must sign `resolveWager`
- Verify keypair is loaded correctly

### "Math overflow"
- Check amount calculations
- Ensure amounts fit in u64

## 📚 Resources

- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [Anchor Examples](https://github.com/coral-xyz/anchor/tree/master/examples)

## ✅ Checklist

- [ ] Install Anchor and Solana CLI
- [ ] Build and deploy program
- [ ] Update program ID in code
- [ ] Set platform treasury address
- [ ] Generate backend authority keypair
- [ ] Store backend authority securely
- [ ] Update IDL in frontend
- [ ] Test create_wager
- [ ] Test join_wager
- [ ] Test resolve_wager
- [ ] Integrate with Supabase Edge Functions
- [ ] Deploy to mainnet (when ready)


