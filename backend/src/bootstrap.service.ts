import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ApiService } from './api/api.service';
import { IGame, IProvider } from './interfaces/external-api.interface';
import { LeaderboardService } from './leaderboard/leaderboard.service';
import * as fs from 'fs';
import * as path from 'path';
const chalk = require('chalk');

@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
    constructor(
        private readonly apiService: ApiService,
        private readonly leaderboardService: LeaderboardService,
    ) { }

    async initProviderListAsync() {
        const agentCode = process.env.AGENT_CODE;
        const agentToken = process.env.AGENT_TOKEN;
        const gameType = process.env.GAME_TYPE;

        if (!agentCode || !agentToken || !gameType) {
            throw new Error('Environment variables AGENT_CODE, AGENT_TOKEN, and GAME_TYPE must be set');
        }

        if (!agentCode || !agentToken) {
            throw new Error('Agent code and token must be provided');
        }
        // Enable retry for bootstrap initialization
        return this.apiService.fetchProviderListAsync(agentCode, agentToken, gameType, true);
    }

    async initGameListAsync(providerCode: string) {
        const agentCode = process.env.AGENT_CODE;
        const agentToken = process.env.AGENT_TOKEN;
        if (!agentCode || !agentToken) {
            throw new Error('Environment variables AGENT_CODE and AGENT_TOKEN must be set');
        }
        if (!providerCode) {
            throw new Error('Provider code must be provided');
        }
        // Enable retry for bootstrap initialization
        return this.apiService.fetchGameListAsync(agentCode, agentToken, providerCode, true);
    }

    async initialize() {
        console.log(chalk.cyanBright('\n=========================================='));
        console.log(chalk.bold.green('✅ Starting Bootstrap Initialization...'));
        console.log(chalk.cyanBright('==========================================\n'));

        console.log(chalk.yellow('🔄 Fetching provider list...'));
        const provider_list: IProvider[] = await this.initProviderListAsync();

    const provider_codes: Record<string, string> = provider_list.reduce((acc, provider) => {
      acc[provider.name] = provider.code;
      return acc;
    }, {} as Record<string, string>);

    // Use src/config in dev, dist/config in production
    const isDev = process.env.NODE_ENV !== 'production';
    const configDir = isDev 
      ? path.join(process.cwd(), 'src', 'config')
      : path.join(__dirname, '..', 'config');
    
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
      console.log(chalk.gray(`📁 Created config directory: ${configDir}`));
    }

    const providerFilePath = path.join(configDir, 'provider.json');
    fs.writeFileSync(providerFilePath, JSON.stringify(provider_list, null, 2), 'utf8');
    console.log(chalk.green(`✅ Provider list updated (${provider_list.length} providers)`));
    console.log(chalk.gray(`📁 Saved to: ${providerFilePath}\n`));

    const gameListDir = path.join(configDir, 'gamelist');
    if (!fs.existsSync(gameListDir)) {
      fs.mkdirSync(gameListDir, { recursive: true });
      console.log(chalk.gray(`📁 Created directory: ${gameListDir}`));
    }

        for (const [name, code] of Object.entries(provider_codes)) {
            console.log(chalk.yellow(`\n🎯 Fetching game list for provider: ${chalk.bold(name)}...`));
            const games: IGame[] = await this.initGameListAsync(code);

            if (!games || games.length === 0) {
                console.log(chalk.redBright(`⚠️  No games found for provider: ${name}`));
                continue;
            }

            const filePath = path.join(gameListDir, `${name}_GAME.json`);
            fs.writeFileSync(filePath, JSON.stringify(games, null, 2), 'utf8');
            console.log(chalk.green(`✅ Game list for ${name} updated (${games.length} games)`));
            console.log(chalk.gray(`📁 Saved to: ${filePath}`));
        }

        console.log(chalk.cyanBright('\n=========================================='));
        console.log(chalk.bold.green('✅ Bootstrap Initialization Complete!'));
        console.log(chalk.cyanBright('==========================================\n'));
    }


    async onApplicationBootstrap() {
        const env = process.env.NODE_ENV || 'development';
        console.log(chalk.cyanBright('\n=========================================='));
        console.log(chalk.bold.green('🚀 Project is running in ') + chalk.hex('#ff69b4')(env) + chalk.bold.green(' mode'));
        console.log(chalk.cyanBright('==========================================\n'));
        
        // Initialize leaderboard data on startup (with timeout to prevent blocking)
        console.log(chalk.yellow('🏆 Initializing leaderboard data...'));
        const leaderboardTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
        );
        
        try {
            await Promise.race([
                this.leaderboardService.updateAllLeaderboards(),
                leaderboardTimeout
            ]);
            console.log(chalk.green('✅ Leaderboard initialized successfully\n'));
        } catch (error) {
            if (error.message === 'Timeout') {
                console.log(chalk.yellow(`⚠️  Leaderboard initialization timed out (will retry later)`));
            } else {
                console.log(chalk.yellow(`⚠️  Could not initialize leaderboard: ${error.message}`));
            }
            console.log(chalk.gray('   (This is normal if database is slow or there are no bets yet)\n'));
        }
        
        // Check if config files already exist
        // Use src/config in dev, dist/config in production
        const isDev = process.env.NODE_ENV !== 'production';
        const configDir = isDev 
          ? path.join(process.cwd(), 'src', 'config')
          : path.join(__dirname, '..', 'config');
        const providerFilePath = path.join(configDir, 'provider.json');
        const configExists = fs.existsSync(providerFilePath);
        
        if (!configExists) {
            console.log(chalk.yellow('⚠️  Config files not found. Fetching from aggregator...'));
            try {
                await this.initialize();
            } catch (error) {
                console.log(chalk.red(`❌ Failed to fetch config from aggregator: ${error.message}`));
                console.log(chalk.yellow('⚠️  Server will continue with existing config or manual setup required.'));
            }
        } else {
            console.log(chalk.green('✅ Config files found. Skipping bootstrap.\n'));
        }
    }
}