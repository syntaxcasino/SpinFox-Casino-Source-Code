import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TransactionService } from 'src/transaction/transaction.service';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { Transaction, ChainType, TokenType } from '../transaction/entities/transaction.entity';
import { Connection, sendAndConfirmTransaction, Transaction as SolTransaction, PublicKey, Keypair } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import axios from 'axios';
import { ApiService } from 'src/api/api.service';
import { networks, payments, Psbt } from 'bitcoinjs-lib';

import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import * as tinysecp from 'tiny-secp256k1';
import { rpcManager, CHAIN_IDS } from '../utils/rpc-manager';

const ECPair = ECPairFactory(tinysecp);

type WithdrawalJobData = {
    txId: string; // Transaction DB ID
};

// ERC20 ABI for transfer function
const ERC20_ABI = [
    'function transfer(address to, uint256 amount) returns (bool)',
    'function balanceOf(address account) view returns (uint256)',
];

// Token addresses for each chain
const TOKEN_ADDRESSES: Record<ChainType, Record<TokenType, string | null>> = {
    ethereum: {
        USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        ETH: null,
        BTC: null,
        SOL: null,
    },
    optimism: {
        USDC: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
        USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
        ETH: null,
        BTC: null,
        SOL: null,
    },
    arbitrum: {
        USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        ETH: null,
        BTC: null,
        SOL: null,
    },
    base: {
        USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
        ETH: null,
        BTC: null,
        SOL: null,
    },
    'ethereum-sepolia': {
        USDC: process.env.ETHEREUM_SEPOLIA_USDC_ADDRESS || null,
        USDT: process.env.ETHEREUM_SEPOLIA_USDT_ADDRESS || null,
        ETH: null,
        BTC: null,
        SOL: null,
    },
    'optimism-sepolia': {
        USDC: process.env.OPTIMISM_SEPOLIA_USDC_ADDRESS || null,
        USDT: process.env.OPTIMISM_SEPOLIA_USDT_ADDRESS || null,
        ETH: null,
        BTC: null,
        SOL: null,
    },
    'arbitrum-sepolia': {
        USDC: process.env.ARBITRUM_SEPOLIA_USDC_ADDRESS || null,
        USDT: process.env.ARBITRUM_SEPOLIA_USDT_ADDRESS || null,
        ETH: null,
        BTC: null,
        SOL: null,
    },
    'base-sepolia': {
        USDC: process.env.BASE_SEPOLIA_USDC_ADDRESS || null,
        USDT: process.env.BASE_SEPOLIA_USDT_ADDRESS || null,
        ETH: null,
        BTC: null,
        SOL: null,
    },
    solana: {
        USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        ETH: null,
        BTC: null,
        SOL: null,
    },
    segwit: {
        USDC: null,
        USDT: null,
        ETH: null,
        BTC: null,
        SOL: null,
    },
};

@Processor('withdrawals')
@Injectable()
export class WithdrawalProcessor extends WorkerHost {
    private readonly logger = new Logger(WithdrawalProcessor.name);
    private providers: Record<string, ethers.providers.JsonRpcProvider> = {};

    constructor(
        private config: ConfigService,
        private transactionService: TransactionService,
        private dataSource: DataSource,
        private readonly apiService: ApiService,
    ) {
        super();

        // Initialize providers asynchronously
        this.initializeProviders();
    }

    private async initializeProviders() {
        const chainMap = {
            ethereum: CHAIN_IDS.ETHEREUM_MAINNET,
            optimism: CHAIN_IDS.OPTIMISM,
            arbitrum: CHAIN_IDS.ARBITRUM,
            base: CHAIN_IDS.BASE,
            'ethereum-sepolia': CHAIN_IDS.ETHEREUM_SEPOLIA,
            'optimism-sepolia': CHAIN_IDS.OPTIMISM_SEPOLIA,
            'arbitrum-sepolia': CHAIN_IDS.ARBITRUM_SEPOLIA,
            'base-sepolia': CHAIN_IDS.BASE_SEPOLIA,
        };

        for (const [chainName, chainId] of Object.entries(chainMap)) {
            try {
                // Check if env var exists first
                const envRpc = this.config.get(`${chainName.toUpperCase()}_RPC`);
                let rpcUrl: string;
                
                if (envRpc) {
                    rpcUrl = envRpc;
                } else {
                    // Fetch from RPC manager
                    rpcUrl = await rpcManager.getRPC(chainId);
                }
                
                this.providers[chainName] = new ethers.providers.JsonRpcProvider(rpcUrl);
                this.logger.log(`✅ Initialized provider for ${chainName}: ${rpcUrl}`);
            } catch (error) {
                this.logger.error(`❌ Failed to initialize provider for ${chainName}:`, error);
            }
        }
    }

    async process(job: Job) {
        const { txId } = job.data as WithdrawalJobData;

        // Use findById instead of findByTxHash
        const tx = await this.transactionService.findById(txId);
        if (!tx) {
            this.logger.warn(`⚠️ Withdrawal transaction not found: ${txId}`);
            return;
        }

        // Skip if already completed or failed
        if (tx.status === 'completed' || tx.status === 'failed') {
            this.logger.log(`ℹ️ Transaction ${txId} already ${tx.status}, skipping`);
            return;
        }

        try {
            this.logger.log(`🔄 Processing withdrawal ${tx.id} for ${tx.amount} ${tx.token} on ${tx.chain}`);

            switch (tx.chain as ChainType) {
                case 'ethereum':
                case 'optimism':
                case 'arbitrum':
                case 'base':
                case 'ethereum-sepolia':
                case 'optimism-sepolia':
                case 'arbitrum-sepolia':
                case 'base-sepolia':
                    await this.handleEvmWithdrawal(tx);
                    break;
                case 'solana':
                    await this.handleSolanaWithdrawal(tx);
                    break;
                default:
                    throw new Error(`Unsupported chain: ${tx.chain}`);
            }
        } catch (err) {
            this.logger.error(`❌ Withdrawal failed for ${tx.id}: ${err.message}`);
            await this.updateWithdrawal(tx, null, 'failed');
            throw err; // Let BullMQ handle retry
        }
    }

    // ---------------- EVM Withdrawal ----------------
    private async handleEvmWithdrawal(tx: Transaction) {
        const provider = this.providers[tx.chain];
        if (!provider) throw new Error(`No provider for ${tx.chain}`);

        const hotWalletKey = this.config.get('HOT_WALLET_PRIVATE_KEY') || this.config.get('EVM_HOT_WALLET_PRIVATE_KEY');
        if (!hotWalletKey) {
            throw new Error('HOT_WALLET_PRIVATE_KEY not configured');
        }

        const wallet = new ethers.Wallet(hotWalletKey, provider);
        
        // Get token address
        const tokenAddress = TOKEN_ADDRESSES[tx.chain][tx.token];
        if (!tokenAddress) {
            throw new Error(`Token ${tx.token} not supported on ${tx.chain}`);
        }

        // Create ERC20 contract instance
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);

        // Parse amount (USDC/USDT have 6 decimals)
        const amount = ethers.utils.parseUnits(tx.amount, 6);

        this.logger.log(`📤 Sending ${tx.amount} ${tx.token} to ${tx.walletAddress} on ${tx.chain}`);

        // Send ERC20 transfer transaction
        const sentTx = await tokenContract.transfer(tx.walletAddress, amount);
        this.logger.log(`⏳ Transaction sent, hash: ${sentTx.hash}, waiting for confirmation...`);

        // Wait for confirmation
        const receipt = await sentTx.wait(1);
        
        if (receipt.status === 1) {
            await this.updateWithdrawal(tx, sentTx.hash, 'completed');
            this.logger.log(`✅ EVM withdrawal completed: ${tx.id} -> ${tx.walletAddress}, txHash: ${sentTx.hash}`);
        } else {
            throw new Error('Transaction failed on chain');
        }
    }

    // ---------------- Solana Withdrawal ----------------
    private async handleSolanaWithdrawal(tx: Transaction) {
        const DEFAULT_SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
        const rawRpc = this.config.get<string>('SOLANA_RPC');
        const solanaRpc = rawRpc && /^https?:\/\//i.test(rawRpc) ? rawRpc : DEFAULT_SOLANA_RPC;
        if (rawRpc && !/^https?:\/\//i.test(rawRpc)) {
            this.logger?.warn?.(`Invalid SOLANA_RPC "${rawRpc}", falling back to ${DEFAULT_SOLANA_RPC}`);
        }
        const connection = new Connection(solanaRpc, 'confirmed');
        
        const hotWalletSecret = this.config.get('SOLANA_HOT_WALLET') || this.config.get('SOL_HOT_WALLET_PRIVATE_KEY');
        if (!hotWalletSecret) {
            throw new Error('SOLANA_HOT_WALLET not configured');
        }

        const fromKeypair = Keypair.fromSecretKey(
            Uint8Array.from(JSON.parse(hotWalletSecret))
        );

        // Get token mint address
        const tokenMintAddress = TOKEN_ADDRESSES.solana[tx.token];
        if (!tokenMintAddress) {
            throw new Error(`Token ${tx.token} not supported on Solana`);
        }

        const tokenMint = new PublicKey(tokenMintAddress);
        const recipientPubkey = new PublicKey(tx.walletAddress);

        // Get associated token accounts
        const fromTokenAccount = await getAssociatedTokenAddress(
            tokenMint,
            fromKeypair.publicKey
        );

        const toTokenAccount = await getAssociatedTokenAddress(
            tokenMint,
            recipientPubkey
        );

        // Parse amount (USDC/USDT on Solana have 6 decimals)
        const amount = Math.floor(parseFloat(tx.amount) * 1_000_000);

        this.logger.log(`📤 Sending ${tx.amount} ${tx.token} to ${tx.walletAddress} on Solana`);

        // Create transfer instruction
        const transferInstruction = createTransferInstruction(
            fromTokenAccount,
            toTokenAccount,
            fromKeypair.publicKey,
            amount,
            [],
            TOKEN_PROGRAM_ID
        );

        // Create and send transaction
        const solTx = new SolTransaction().add(transferInstruction);
        solTx.feePayer = fromKeypair.publicKey;
        solTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        const signature = await sendAndConfirmTransaction(connection, solTx, [fromKeypair], {
            commitment: 'confirmed',
        });

        await this.updateWithdrawal(tx, signature, 'completed');
        this.logger.log(`✅ Solana withdrawal completed: ${tx.id} -> ${tx.walletAddress}, signature: ${signature}`);
    }

    private async updateWithdrawal(tx: Transaction, txHash: string | null, status: 'completed' | 'failed') {
        tx.txHash = txHash || '';
        tx.status = status;
        await this.transactionService.updateTransaction(tx);
    }
}
