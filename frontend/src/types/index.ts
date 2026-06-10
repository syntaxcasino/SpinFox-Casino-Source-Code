export interface IProvider {
    type: string;
    name: string;
    code: string;
    backoffice: string;
}

export interface IProviderListResponse {
    status: number;
    msg: string;
    providers: IProvider[];
}

export interface IGame {
    id: number;
    sort: number;
    lang: string;
    providerCode: string;
    game_code: string;
    game_name: string;
    banner: string;
    status: number;
}

export interface IGameListInterface {
    status: number;
    msg: string;
    games: IGame[];
}

export interface IGameResponse {
    status: number;
    msg: string;
    launch_url: string;
    agent_code: string;
    agent_balance: number;
    agent_type: string;
    user_code: string;
    user_balance: number;
    user_created: boolean;
    user_deposit: boolean;
    currency: string;
    lang: string;
}

export interface IUser {
    id: number;
    email: string;
    username: string;
    user_code: string;
    balance: number; // Display balance (switches between real and test based on network)
    bonusBalance: number;
    realBalance: number;  // For mainnet chains
    testBalance: number;  // For testnet chains
    loyaltyPoints: number;
    level: number;
    isLoggedIn: boolean;
    avatar: string;
    user_balance: number;
    user_total_debit: number;
    user_total_credit: number;
    user_target_rtp: number;
    user_real_rtp: number;
    createdAt: string;
    role: string;
    favorites: string;
    EVMAddress: string;
    SOLAddress: string;
    BTCAddress: string;
    solBalance: string;
    ethBalance: string;
    btcBalance: string;
    usdtBalance: string;
    usdcBalance: string;
}

export interface IAgentData {
    status: number;
    msg: string;
    agent_code: string;
    agent_balance: number;
    agent_type: string;
    agent_total_debit: number;
    agent_total_credit: number;
    agent_target_rtp: number;
    agent_real_rtp: number;
    agent_created_at: string;
    currency: string;
    user_list: IUser[];
}

export interface IAgentResponse {
    username: string;
    agentData: IAgentData;
}