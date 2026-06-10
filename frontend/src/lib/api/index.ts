import { IGame, IProvider, IAgentData, IUser, IAgentResponse } from "@/types";

import { encryptReq, decryptRes } from "@/utils/crypto.util";

export async function fetchProviderListAsync(): Promise<IProvider[]> {
  const url = process.env.NEXT_PUBLIC_API_URL;
  const requestOptions: RequestInit = {
    method: "POST",
    redirect: "follow",
  };

  try {
    const response = await fetch(`${url}/casino/provider-list`, requestOptions);
    const result = await response.json();
    if (result.encData) {
      return decryptRes(result.encData);
    }
    return result;
  } catch (error) {
    console.error("get provider list api: ", error);
  }
}

export async function fetchGameListAsync(
  providerCode: string
): Promise<IGame[]> {
  const url = process.env.NEXT_PUBLIC_API_URL;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const encryptedBody = encryptReq({ provider_code: providerCode });
  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(encryptedBody),
    redirect: "follow",
  };

  try {
    const response = await fetch(`${url}/casino/game-list`, requestOptions);
    const result = await response.json();
    if (result.encData) {
      return decryptRes(result.encData);
    }
    return result;
  } catch (error) {
    console.error("get game list api: ", error);
  }
}

export async function fetchGameLaunchAsync(
  providerCode: string,
  gameCode: string,
  token: string,
  balanceType: 'realBalance' | 'testBalance' = 'realBalance'
): Promise<any> {
  const url = process.env.NEXT_PUBLIC_API_URL;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${token}`);

  const encryptedBody = encryptReq({
    provider_code: providerCode,
    game_code: gameCode,
    balanceType: balanceType, // Send balance type to backend
  });

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(encryptedBody),
    redirect: "follow",
  };

  try {
    const response = await fetch(`${url}/casino/game-launch`, requestOptions);
    const result = await response.json();
    if (result.encData) {
      return decryptRes(result.encData);
    }
    return result;
  } catch (error) {
    console.error("game launch api: ", error);
  }
}

export async function signup(
  username: string,
  email: string,
  password: string
): Promise<any> {
  const url = process.env.NEXT_PUBLIC_API_URL;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const encryptedBody = encryptReq({ username, email, password });

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(encryptedBody),
    redirect: "follow",
  };

  try {
    const response = await fetch(`${url}/auth/register`, requestOptions);
    const result = await response.json();
    if (result.encData) {
      return decryptRes(result.encData);
    }
    return result;
  } catch (error) {
    console.error("login api: ", error);
  }
}

export async function signin(
  usernameOrEmail: string,
  password: string
): Promise<any> {
  const url = process.env.NEXT_PUBLIC_API_URL;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const encryptedBody = encryptReq({ usernameOrEmail, password });

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(encryptedBody),
    redirect: "follow",
  };

  try {
    const response = await fetch(`${url}/auth/login`, requestOptions);
    const result = await response.json();
    if (result.encData) {
      return decryptRes(result.encData);
    }
    return result;
  } catch (error) {
    console.error("login api: ", error);
  }
}

export async function verifyEmailRequest(
  email: string,
  code: string
): Promise<any> {
  const url = process.env.NEXT_PUBLIC_API_URL;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const encryptedBody = encryptReq({ email, code });

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(encryptedBody),
    redirect: "follow",
  };

  try {
    const response = await fetch(`${url}/auth/verify-email`, requestOptions);

    if (!response.ok) {
      throw new Error(`Verify email failed: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.encData) {
      return decryptRes(result.encData);
    }

    return result;
  } catch (error) {
    console.error("verifyEmailRequest error:", error);
    throw error;
  }
}

export async function fetchUserInfo(token: string): Promise<IUser | any> {
  const url = process.env.NEXT_PUBLIC_API_URL;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${token}`);

  // Encrypt request body (send empty object if no params needed)
  const encryptedBody = encryptReq({});

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(encryptedBody),
    redirect: "follow",
  };

  try {
    const response = await fetch(`${url}/auth/user`, requestOptions);
    const encryptedResponse = await response.json();

    const userResponse: IUser = encryptedResponse.encData
      ? decryptRes<IUser>(encryptedResponse.encData)
      : encryptedResponse;
    return userResponse;
  } catch (error) {
    console.error("User Info: ", error);
    throw error;
  }
}

export async function resendVerificationRequest(email: string): Promise<any> {
  const url = process.env.NEXT_PUBLIC_API_URL;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const encryptedBody = encryptReq({ email });

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(encryptedBody),
    redirect: "follow",
  };

  try {
    const response = await fetch(
      `${url}/auth/resend-verification`,
      requestOptions
    );

    if (!response.ok) {
      throw new Error(`Resend verification failed: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.encData) {
      return decryptRes(result.encData);
    }

    return result;
  } catch (error) {
    console.error("resendVerificationRequest error:", error);
    throw error;
  }
}

export async function forgotPasswordRequest(email: string): Promise<any> {
  const url = process.env.NEXT_PUBLIC_API_URL;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const encryptedBody = encryptReq({ email });

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(encryptedBody),
    redirect: "follow",
  };

  try {
    const response = await fetch(`${url}/auth/forgot-password`, requestOptions);

    if (!response.ok) {
      throw new Error(`Forgot password request failed: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.encData) {
      return decryptRes(result.encData);
    }

    return result;
  } catch (error) {
    console.error("forgotPasswordRequest error:", error);
    throw error;
  }
}

export async function resetPasswordRequest(
  token: string,
  newPassword: string
): Promise<any> {
  const url = process.env.NEXT_PUBLIC_API_URL;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const encryptedBody = encryptReq({ token, newPassword });

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(encryptedBody),
    redirect: "follow",
  };

  try {
    const response = await fetch(`${url}/auth/reset-password`, requestOptions);

    if (!response.ok) {
      throw new Error(`Reset password request failed: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.encData) {
      return decryptRes(result.encData);
    }

    return result;
  } catch (error) {
    console.error("resetPasswordRequest error:", error);
    throw error;
  }
}

export async function fetchEmailFromUsername(
  username: string
): Promise<string> {
  const url = process.env.NEXT_PUBLIC_API_URL;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  // ✅ Encrypt request body with username
  const encryptedBody = encryptReq({ username });

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(encryptedBody),
    redirect: "follow",
  };

  try {
    const response = await fetch(`${url}/auth/get-email`, requestOptions);
    const encryptedResponse = await response.json();

    // ✅ Decrypt backend response
    const decryptedResponse = encryptedResponse.encData
      ? decryptRes<{ email: string }>(encryptedResponse.encData)
      : encryptedResponse;

    if (!decryptedResponse?.email) {
      throw new Error("Email not found in response");
    }

    return decryptedResponse.email;
  } catch (error) {
    console.error("Error fetching email from username:", error);
    throw error;
  }
}

export async function fetchUserInfoAsync(token: string): Promise<IUser> {
  const url = process.env.NEXT_PUBLIC_API_URL;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${token}`);

  // Encrypt request body (send empty object if no params needed)
  const encryptedBody = encryptReq({});

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(encryptedBody),
    redirect: "follow",
  };

  try {
    const response = await fetch(`${url}/casino/userinfo`, requestOptions);
    const encryptedResponse = await response.json();

    // Decrypt backend response
    const agentResponse: IAgentResponse = encryptedResponse.encData
      ? decryptRes<IAgentResponse>(encryptedResponse.encData)
      : encryptedResponse;

    if (!agentResponse.agentData.user_list) {
      throw new Error("User list not found in response");
    }
    const userInfo: IUser | undefined = agentResponse.agentData.user_list.find(
      (user) =>
        user.user_code.toLowerCase() === agentResponse.username.toLowerCase()
    );

    if (!userInfo) {
      throw new Error("User not found in response");
    }

    return userInfo;
  } catch (error) {
    console.error("User Info: ", error);
    throw error;
  }
}

export async function fetchUserById(
  token: string,
  id: number
): Promise<IUser | any> {
  const url = process.env.NEXT_PUBLIC_API_URL;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${token}`);

  // Encrypt request body (send empty object if no params needed)
  const encryptedBody = encryptReq({ id });

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(encryptedBody),
    redirect: "follow",
  };

  try {
    const response = await fetch(`${url}/auth/userbyid`, requestOptions);
    const encryptedResponse = await response.json();

    const userResponse: IUser = encryptedResponse.encData
      ? decryptRes<IUser>(encryptedResponse.encData)
      : encryptedResponse;
    return userResponse;
  } catch (error) {
    console.error("User Info: ", error);
    throw error;
  }
}

/**
 * Admin function: Manually credit balance to a user
 * Use cases: bonuses, promotions, compensation, manual adjustments
 * 
 * In seamless mode: Updates local database balance only
 * Aggregator will query our balance via user_balance callback
 */
export async function adminCreditUser(
  token: string,
  userid: number,
  amount: number
): Promise<IUser | any> {
  const url = process.env.NEXT_PUBLIC_API_URL;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${token}`);

  const encryptedBody = encryptReq({ depositUserId: userid, amount });

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(encryptedBody),
    redirect: "follow",
  };

  try {
    const response = await fetch(
      `${url}/casino/deposituserbalance`,
      requestOptions
    );
    const encryptedResponse = await response.json();

    const userResponse: IUser = encryptedResponse.encData
      ? decryptRes<IUser>(encryptedResponse.encData)
      : encryptedResponse;
    return userResponse;
  } catch (error) {
    console.error("Admin credit user error:", error);
    throw error;
  }
}

// Deprecated: Use adminCreditUser instead
export const depositToUser = adminCreditUser;

export async function userFavorites(
  token: string,
  favorites: string
): Promise<any> {
  const url = process.env.NEXT_PUBLIC_API_URL;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${token}`);

  // Encrypt request body (send empty object if no params needed)
  const encryptedBody = encryptReq({ favorites });

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(encryptedBody),
    redirect: "follow",
  };

  try {
    const response = await fetch(`${url}/casino/setfavorites`, requestOptions);
    const encryptedResponse = await response.json();

    const result: any = encryptedResponse.encData
      ? decryptRes<any>(encryptedResponse.encData)
      : encryptedResponse;
    return result;
  } catch (error) {
    console.error("User Info: ", error);
    throw error;
  }
}

export async function fetchAllUsers(token: string): Promise<IUser[] | null> {
  const url = process.env.NEXT_PUBLIC_API_URL;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${token}`);

  // Encrypt request body (send empty object if no params needed)
  const encryptedBody = encryptReq({});

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(encryptedBody),
    redirect: "follow",
  };

  try {
    const response = await fetch(`${url}/auth/users`, requestOptions);
    const encryptedResponse = await response.json();

    const userResponse: IUser[] = encryptedResponse.encData
      ? decryptRes<IUser[]>(encryptedResponse.encData)
      : encryptedResponse;
    return userResponse;
  } catch (error) {
    console.error("User Info: ", error);
    throw error;
  }
}

export async function fetchSweepableUsers(): Promise<IUser[] | undefined> {
  const url = process.env.NEXT_PUBLIC_API_URL;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
  };

  try {
    const response = await fetch(
      `${url}/admin/fetch-sweepable-users`,
      requestOptions
    );
    const result = await response.json();
    if (result.encData) {
      return decryptRes(result.encData);
    }
    return result;
  } catch (error) {
    console.error("get game list api: ", error);
  }
}


export async function sweepAllUsers(): Promise<any> {
  const url = process.env.NEXT_PUBLIC_API_URL;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
  };

  try {
    const response = await fetch(
      `${url}/admin/sweep-from-users`,
      requestOptions
    );
    const result = await response.json();
    if (result.encData) {
      return decryptRes(result.encData);
    }
    return result;
  } catch (error) {
    console.error("get game list api: ", error);
  }
}

// ============= SPORTS BETTING API =============

export interface PlaceBetRequest {
  betType?: 'single' | 'parlay';
  
  // For single bets
  gameId?: string;
  sportId?: number;
  typeId?: number;
  maturity?: number;
  line?: number;
  playerId?: number;
  odds?: number;
  oddsType?: string; // 'decimal', 'normalizedImplied', or 'american'
  position?: number;
  homeTeam?: string;
  awayTeam?: string;
  tournamentName?: string;
  positionLabel?: string;
  marketType?: string;
  
  // For parlay bets
  parlaySelections?: Array<{
    gameId: string;
    sportId: number;
    typeId: number;
    maturity: number;
    line?: number;
    playerId: number;
    position: number;
    homeTeam: string;
    awayTeam: string;
    tournamentName?: string;
    positionLabel: string;
    marketType?: string;
    odds: number;
    oddsType: string;
  }>;
  
  // Common fields
  amount: number;
  combinedPositions?: any;
  merkleProof?: string[];
  live?: boolean;
  networkId?: number;
}

export interface SportsBet {
  id: number;
  userId: number;
  betType: 'single' | 'parlay';
  // Single bet fields (nullable for parlay)
  gameId?: string;
  sportId?: number;
  typeId?: number;
  maturity?: number;
  line?: number;
  playerId?: number;
  position?: number;
  homeTeam?: string;
  awayTeam?: string;
  tournamentName?: string;
  positionLabel?: string;
  marketType?: string;
  // Parlay selections
  parlaySelections?: Array<{
    gameId: string;
    sportId: number;
    typeId: number;
    maturity: number;
    line?: number;
    playerId: number;
    position: number;
    homeTeam: string;
    awayTeam: string;
    tournamentName?: string;
    positionLabel: string;
    marketType?: string;
    odds: number;
    oddsType: string;
  }>;
  // Common fields
  amount: number;
  odds: number;
  oddsType?: string; // 'decimal', 'normalizedImplied', or 'american'
  potentialPayout: number;
  actualPayout: number;
  status: 'open' | 'won' | 'lost' | 'cancelled';
  claimed: boolean;
  combinedPositions?: any;
  merkleProof?: string[];
  live: boolean;
  networkId: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Place a sports bet
 */
export async function placeSportsBet(
  token: string,
  betData: PlaceBetRequest
): Promise<SportsBet> {
  const url = process.env.NEXT_PUBLIC_API_URL;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${token}`);

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(betData),
    redirect: "follow",
  };

  try {
    const response = await fetch(`${url}/sports/bets`, requestOptions);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to place bet");
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Place sports bet error:", error);
    throw error;
  }
}

/**
 * Get user sports bets
 */
export async function getUserSportsBets(
  token: string,
  status?: 'open' | 'won' | 'lost' | 'cancelled'
): Promise<SportsBet[]> {
  const url = process.env.NEXT_PUBLIC_API_URL;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${token}`);

  const queryParams = status ? `?status=${status}` : '';

  const requestOptions: RequestInit = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  try {
    const response = await fetch(`${url}/sports/bets${queryParams}`, requestOptions);
    if (!response.ok) {
      throw new Error("Failed to fetch bets");
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Get sports bets error:", error);
    throw error;
  }
}

/**
 * Claim winnings for a bet
 */
export async function claimSportsBetWinnings(
  token: string,
  betId: number
): Promise<SportsBet> {
  const url = process.env.NEXT_PUBLIC_API_URL;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${token}`);

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    redirect: "follow",
  };

  try {
    const response = await fetch(`${url}/sports/bets/${betId}/claim`, requestOptions);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to claim winnings");
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Claim winnings error:", error);
    throw error;
  }
}

/**
 * Get withdrawal fees for all supported chains
 */
export async function getWithdrawalFees(token: string): Promise<any> {
  const url = process.env.NEXT_PUBLIC_API_URL;
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${token}`);

  const requestOptions: RequestInit = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  try {
    const response = await fetch(`${url}/withdrawals/fees`, requestOptions);
    if (!response.ok) {
      throw new Error("Failed to fetch withdrawal fees");
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Get withdrawal fees error:", error);
    throw error;
  }
}

/**
 * Create a withdrawal request
 */
export async function createWithdrawal(
  token: string,
  withdrawalData: {
    token: 'USDC' | 'USDT';
    amount: string;
    walletAddress: string;
    chain: 'ethereum' | 'optimism' | 'arbitrum' | 'base' | 'solana' | 'ethereum-sepolia' | 'optimism-sepolia' | 'arbitrum-sepolia' | 'base-sepolia';
  }
): Promise<any> {
  const url = process.env.NEXT_PUBLIC_API_URL;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${token}`);

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(withdrawalData),
    redirect: "follow",
  };

  try {
    const response = await fetch(`${url}/withdrawals`, requestOptions);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || "Failed to create withdrawal");
    }
    
    return result;
  } catch (error) {
    console.error("Create withdrawal error:", error);
    throw error;
  }
}

/**
 * Get transaction history for the current user
 */
export async function getTransactionHistory(
  token: string,
  limit: number = 50
): Promise<any> {
  const url = process.env.NEXT_PUBLIC_API_URL;
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${token}`);

  const requestOptions: RequestInit = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  try {
    const response = await fetch(`${url}/transactions/history?limit=${limit}`, requestOptions);
    if (!response.ok) {
      throw new Error("Failed to fetch transaction history");
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Get transaction history error:", error);
    throw error;
  }
}

/**
 * Get casino transaction history (game bets/wins)
 */
export async function getCasinoTransactionHistory(
  token: string,
  limit: number = 50,
  offset: number = 0
): Promise<any> {
  const url = process.env.NEXT_PUBLIC_API_URL;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${token}`);

  const encryptedBody = encryptReq({ limit, offset });

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(encryptedBody),
    redirect: "follow",
  };

  try {
    const response = await fetch(`${url}/casino/transaction-history`, requestOptions);
    if (!response.ok) {
      throw new Error("Failed to fetch casino transaction history");
    }
    const result = await response.json();
    if (result.encData) {
      return decryptRes(result.encData);
    }
    return result;
  } catch (error) {
    console.error("Get casino transaction history error:", error);
    throw error;
  }
}