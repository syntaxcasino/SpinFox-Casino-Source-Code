// auth/auth.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as fs from 'fs';
import * as path from 'path';
import { ApiService } from 'src/api/api.service';
import { User } from 'src/auth/entities/user.entity';
import { IUser } from 'src/interfaces/user.interface';
import { Repository } from 'typeorm';
import { CasinoTransaction } from './entities/casino-transaction.entity';
import Redis from 'ioredis';

@Injectable()
export class CasinoService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(CasinoTransaction)
        private casinoTransactionRepository: Repository<CasinoTransaction>,
        private readonly apiService: ApiService,
        @Inject('REDIS_CLIENT') private redis: Redis,
    ) { }

    async providerList(): Promise<any> {
        try {
            const isDev = process.env.NODE_ENV !== 'production';
            
            // In production mode, fetch fresh data from aggregator every time
            if (!isDev) {
                const agentCode = process.env.AGENT_CODE;
                const agentToken = process.env.AGENT_TOKEN;
                const gameType = process.env.GAME_TYPE;

                if (!agentCode || !agentToken || !gameType) {
                    throw new Error('Environment variables AGENT_CODE, AGENT_TOKEN, and GAME_TYPE must be set');
                }

                return this.apiService.fetchProviderListAsync(agentCode, agentToken, gameType, false);
            }
            
            // In development mode, use cached file for faster performance
            const providerFilePath = path.join(process.cwd(), 'src', 'config', 'provider.json');
            
            if (!fs.existsSync(providerFilePath)) {
                throw new Error('Provider list file not found. Run bootstrap to generate it.');
            }
            const data = fs.readFileSync(providerFilePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading provider list:', error);
            throw new Error(`Failed to fetch provider list: ${error.message}`);
        }
    }


    async gameList(provider_code: string): Promise<any> {
        try {
            const isDev = process.env.NODE_ENV !== 'production';
            
            // In production mode, fetch fresh data from aggregator every time
            if (!isDev) {
                const agentCode = process.env.AGENT_CODE;
                const agentToken = process.env.AGENT_TOKEN;

                if (!agentCode || !agentToken) {
                    throw new Error('Environment variables AGENT_CODE and AGENT_TOKEN must be set');
                }

                return this.apiService.fetchGameListAsync(agentCode, agentToken, provider_code, false);
            }
            
            // In development mode, use cached file for faster performance
            const gameListFilePath = path.join(process.cwd(), 'src', 'config', 'gamelist', `${provider_code}_GAME.json`);
            
            if (!fs.existsSync(gameListFilePath)) {
                throw new Error(`Game list for provider ${provider_code} not found at ${gameListFilePath}`);
            }
            const data = fs.readFileSync(gameListFilePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading game list:', error);
            throw new Error(`Failed to fetch game list: ${error.message}`);
        }
    }

    async gameLaunch(provider_code: string, game_code: string, username: string, balanceType: 'realBalance' | 'testBalance' = 'realBalance'): Promise<any> {
        try {
            const agentCode = process.env.AGENT_CODE;
            const agentToken = process.env.AGENT_TOKEN;
            const gameType = process.env.GAME_TYPE;
            if (!agentCode || !agentToken || !gameType) {
                throw new Error('Environment variables AGENT_CODE, AGENT_TOKEN, and GAME_TYPE must be set');
            }
            
            // Get user balance for seamless integration
            const user = await this.userRepository.findOne({ where: { username } });
            if (!user) {
                throw new Error(`User not found: ${username}`);
            }
            
            // Use usercode (lowercase username) for seamless integration
            // This must match what we use in seamless callbacks
            const user_code = user.usercode || username.toLowerCase();
            const userBalance = user[balanceType] || 0;
            
            // Store balance type in Redis for callback to use (expires in 1 hour)
            const cacheKey = `casino_balance_type:${user_code}`;
            await this.redis.setex(cacheKey, 3600, balanceType);
            
            console.log(`🎮 Launching game for user: ${user_code}, balance: ${userBalance} (${balanceType})`);
            
            const launchData = await this.apiService.fetchGameLaunchAsync(
                agentCode, 
                agentToken, 
                user_code, 
                gameType, 
                provider_code, 
                game_code, 
                userBalance
            );
            
            console.log(`✅ Game launch response:`, launchData);
            return { ...launchData, balanceType }; // Return balance type to frontend
        } catch (error) {
            console.error('❌ Error launching game:', error);
            throw new Error(`Failed to launch game: ${error.message}`);
        }
    }

    async userInfo(username: string): Promise<any> {
        try {
            const agentCode = process.env.AGENT_CODE;
            const agentToken = process.env.AGENT_TOKEN;
            if (!agentCode || !agentToken) {
                throw new Error('Environment variables AGENT_CODE and AGENT_TOKEN must be set');
            }
            const userInfo = await this.apiService.fetchUserInfoAsync(agentCode, agentToken, username);
            return {username: username, agentData: userInfo};
        } catch (error) {
            console.error('Error fetching user info:', error);
            throw new Error('Failed to fetch user info');
        }
    }

    async depositUserBalance(depositUserId: number, amount: number): Promise<any> {
        try {
            // In seamless mode, we manage balance locally without calling aggregator APIs
            // The aggregator will call our callbacks (user_balance, game_callback) as needed
            const user = await this.userRepository.findOne({where : {id : depositUserId}});
            if(!user) {
                throw new Error('User not found');
            }
            
            // Update balance locally
            user.realBalance += amount;
            await this.userRepository.save(user);
            
            return {
                success: true,
                user_balance: user.realBalance,
                deposit_amount: amount,
                message: 'Balance updated successfully (seamless mode)',
            };
        } catch (error) {
            console.error('Error depositing to user balance:', error);
            throw new Error('Failed to deposit to user balance');
        }
    }

    async setFavorites(userId: number, favorites: string): Promise<any> {
        try {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new Error('User not found');
            }
            user.favorites = favorites;
            await this.userRepository.save(user);
            return {
                success: true,
                message: 'Favorites updated successfully',
                // data: user.favorites,
            };
        } catch (error) {
            console.error('Error reading game list:', error);
            throw new Error('Failed to fetch game list');
        }
    }

    async getTransactionHistory(userId: number, limit: number = 50, offset: number = 0): Promise<any> {
        try {
            const [transactions, total] = await this.casinoTransactionRepository.findAndCount({
                where: { userId },
                order: { createdAt: 'DESC' },
                take: limit,
                skip: offset,
            });

            return {
                success: true,
                transactions,
                total,
                limit,
                offset,
            };
        } catch (error) {
            console.error('Error fetching transaction history:', error);
            throw new Error('Failed to fetch transaction history');
        }
    }
}
