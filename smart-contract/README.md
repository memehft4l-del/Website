# Clash Royale Wager Escrow Smart Contract

This folder contains all the code and documentation for the Clash Royale 1v1 wagering escrow smart contract.

## Structure

```
smart-contract/
├── program/              # Solana program (Rust/Anchor)
│   ├── src/
│   │   └── lib.rs       # Main program logic
│   ├── Cargo.toml       # Rust dependencies
│   └── Anchor.toml      # Anchor configuration
├── client/               # TypeScript client code
│   ├── wagerEscrow.ts   # Core client functions
│   ├── wagerEscrowClient.ts  # React hooks
│   └── wagers.ts        # Wager utilities
├── idl/                  # IDL (Interface Definition Language)
│   └── wager_escrow.ts  # TypeScript types from IDL
└── docs/                 # Documentation
    ├── SOLANA_ESCROW_SETUP.md
    └── WAGERING_SYSTEM_README.md
```

## Program Overview

The Clash Royale Escrow program handles 1v1 wagering between players:

- **create_wager**: Creator initializes a wager and deposits SOL
- **join_wager**: Opponent joins and deposits matching SOL
- **resolve_wager**: Backend authority resolves and distributes winnings

## Program ID

- **Devnet**: `Boj5LmCSvrNMzJ9mdbTEf2vMZ1HnabZb2p3KHxyQgcDY`

## Building

```bash
cd smart-contract/program
anchor build
```

## Deployment

See `docs/SOLANA_ESCROW_SETUP.md` for deployment instructions.

## Usage

See `docs/WAGERING_SYSTEM_README.md` for usage examples.

