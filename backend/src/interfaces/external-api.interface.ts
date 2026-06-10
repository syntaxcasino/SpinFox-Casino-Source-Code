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