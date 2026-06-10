# SpinFox

SpinFox is a casino and sportsbook demo workspace with a Next.js frontend and a NestJS backend. This repository is intended for preview, reference, and business discussion only.

> This is not the full production source code.

The full SpinFox source has been updated to work with our SynCode API Provider system. The complete production package, private API configuration, database schema/data, deployment setup, and merchant-specific credentials are not included in this public workspace.

## Repository Contents

- `frontend/` - Next.js user interface for casino, slots, sports, wallet, promotions, support, and admin demo screens.
- `backend/` - NestJS backend middleware for authentication, casino provider calls, sports endpoints, transactions, deposits, withdrawals, admin tools, and callbacks.
- `backend/config/` - Sample provider and game-list configuration files used by the demo structure.

## Important Notice

This repository does not include:

- Full production source code
- Database dump, schema export, or live database credentials
- Production `.env` files or merchant secrets
- SynCode private API credentials
- ClientID / ClientSecret values
- White IP registration data
- Deployment infrastructure
- Full provider contracts or commercial configuration

The public files are provided as a partial codebase/demo reference. A working production deployment requires the complete private source, database setup, API credentials, backend configuration, and SynCode integration support.

## SynCode API Provider

SynCode is a Casino API System Provider for operators, distributors, and iGaming businesses that need casino API integration, white label casino platform support, backend operations, reporting, user control, and secure API access.

### Game Categories

- Casino Slots
- Live Casino Games
- Mini Games
- Fishing Games
- Sportsbook

### Platform Services

- Casino API Integration System
- Casino White Label Platform
- Backend Admin / Operator Panel
- Merchant Management
- Provider and Game Management
- Real-Time Dashboard Monitoring
- Financial Reports and GGR Tracking
- Manual and Automatic User Call / Callback System
- Real-Time Currency Exchange Support
- White IP Security System
- Setup Assistance and Technical Support

## Commercial Model

SynCode supports a Prepayment + GGR Hybrid Model, also known as a GGR Rate Prepayment System.

Formula:

```text
Deposit Amount / GGR Rate x 100 = USD Credit
```

Example with a 20% GGR rate:

```text
$100 / 20 x 100 = $500 USD Credit
$500 / 20 x 100 = $2,500 USD Credit
```

This model allows qualified merchants to begin operating with platform credit while using a fair GGR-based structure.

## Security Model

SynCode API access is secured through merchant credentials and White IP protection.

Each approved merchant receives:

- ClientID
- ClientSecret

Each merchant must also register their server IP address. Only registered server IPs are allowed to communicate with the API. White IP registration is handled manually by the admin team to reduce unauthorized access risk.

## Account Types

- Operator - Has own users and manages direct player activity.
- Distributor - Does not have direct users and manages sub-agents or downstream partners.
- Combinator - Has both operator and distributor functions.

## RTP Management

The SynCode system supports RTP configuration by provider, merchant/operator, and user level where legally permitted and properly configured.

RTP settings must only be used according to applicable laws, provider rules, and operational compliance requirements. SynCode does not support hidden manipulation, unfair gameplay, or illegal configuration.

## Currency Exchange

SynCode can use real-time currency conversion through ExchangeRate-API to help calculate currency values based on live exchange rates.

## Technology Overview

This partial workspace includes:

- Next.js 14 frontend
- React 18
- Tailwind CSS
- NestJS backend
- TypeORM-based entities and modules
- Socket.IO integrations
- Casino, sports, wallet, promotion, leaderboard, admin, and support modules
- Crypto deposit/withdrawal related structure for supported chains

## Local Development Notes

This repository is not guaranteed to run as-is because required private configuration and database resources are not included.

For local review only:

```bash
cd backend
npm install
npm run start:dev
```

```bash
cd frontend
npm install
npm run dev
```

You must provide your own environment variables, database, Redis/configuration services if required, API credentials, and provider access.

## GitHub Upload Safety

Before uploading this workspace to GitHub, do not commit:

- `.env`
- `.env.local`
- `.env.production`
- Database credentials
- JWT secrets
- API keys
- Mail credentials
- RPC keys
- Wallet private keys
- Hot wallet seed/private material
- Production merchant credentials

This workspace includes a root `.gitignore` to help prevent accidental credential uploads.

## Contact

For the complete SynCode-ready source code, API integration details, custom setup, pricing, provider support, or merchant onboarding:

- Telegram: `@syntaxcasino`
- Discord: https://discord.gg/kpGJ4yq26h

Serious merchants, operators, and distributors can contact us to discuss business model, target market, traffic plan, platform structure, provider needs, and API integration requirements.

## Disclaimer

This project is intended for legitimate casino API integration and white label platform discussions only. Operators are responsible for complying with all applicable laws, licensing rules, provider terms, payment requirements, and responsible gaming obligations in their operating jurisdictions.
