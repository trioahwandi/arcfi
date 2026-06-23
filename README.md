# ArcFi

## The Yield Layer of Arc

ArcFi is a structured yield protocol built on the Arc Testnet, inspired by Pendle-style yield separation mechanics.

It enables users to deposit assets into vaults and receive:

- Principal Tokens (PT)
- Yield Tokens (YT)

This allows separation between principal and future yield in a transparent and composable way.

---

## Overview

ArcFi is designed as a modern institutional DeFi application focused on:

- Structured yield strategies
- Vault-based asset management
- PT/YT tokenization system
- Transparent yield accrual simulation

Built for the Arc ecosystem.

---

## Network

Arc Testnet

- Chain ID: 5042002  
- RPC: https://rpc.testnet.arc.network  
- Explorer: https://testnet.arcscan.app  
- Gas Token: USDC  

---

## Tech Stack

Frontend:
- Next.js 15
- TypeScript
- Tailwind CSS
- Shadcn UI
- Framer Motion

Web3:
- wagmi
- viem
- RainbowKit

Backend:
- Supabase (database and vault simulation)

Charts:
- Recharts

---

## Core Concept

PT / YT System

When users deposit assets:

- Principal Token (PT) represents the original deposited capital, 1:1 redeemable
- Yield Token (YT) represents future yield generated over time

---

## Example Flow

1. User deposits 100 ARC  
2. System splits into:
   - 100 PT-ARC
   - 100 YT-ARC (yield exposure)
3. Yield accrues over time
4. PT remains stable while YT value changes dynamically

---

## Features

- Vault marketplace
- Yield simulation engine
- PT/YT split system
- Portfolio tracking
- Rewards system (AFI)
- Governance module
- Internal documentation system

---

## Vault System

Users can:

- Deposit assets into yield vaults
- Earn APY-based returns
- Track positions in real time
- Withdraw principal depending on vault rules

---

## Smart Contract Architecture (Planned)

- VaultFactory.sol
- Vault.sol
- PrincipalToken.sol
- YieldToken.sol
- RewardDistributor.sol
- Governance.sol

---

## Wallet Support

Supported wallets:

- MetaMask
- Rabby
- Rainbow Wallet
- Coinbase Wallet

Network detection:

- Arc Testnet (Chain ID 5042002)

---

## System Status

This project is in MVP development phase.

Current scope includes:

- Frontend dApp
- Simulation-based yield engine
- Supabase backend integration
- Mock smart contract architecture

---

## Disclaimer

ArcFi is an independent community project built on Arc Testnet.

ArcFi is not affiliated with, endorsed by, or operated by Arc.

All trademarks belong to their respective owners.

---

## Links

Arc Docs: https://docs.arc.io/  
Arc Network Status: https://status.arc.io/  
Arc X (Twitter): https://x.com/arc  
Privacy Policy: https://www.circle.com/legal/privacy-policy  
Terms: https://docs.arc.io/terms  

---

## Vision

ArcFi aims to become the structured yield layer of the Arc ecosystem, providing institutional-grade DeFi mechanics in a simple and transparent interface.

---

## Status

Building MVP on Arc Testnet
Phase: Active Development
