'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IUser } from '@/types';
import type { DepositConfirmedEvent, CasinoBalanceUpdateEvent, SportsBetPlacedEvent, WithdrawalCreatedEvent } from '@/types/socket-events';
import { signin, signup, fetchUserInfo, verifyEmailRequest, resendVerificationRequest, forgotPasswordRequest, resetPasswordRequest } from '@/lib/api';
import { toast } from 'react-toastify';
import { socket } from '@/lib/socket';
import { useNetwork } from './NetworkContext';

interface UserContextType {
  user: IUser | null;
  setUserBalance: (token: string) => Promise<void>;
  isLoggedIn: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<any>;
  register: (username: string, email: string, password: string) => Promise<any>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendVerificationCode: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { activeNetwork } = useNetwork();

  useEffect(() => {
    if (!user?.id) return;

    if (!socket.connected) socket.connect();
    socket.emit('join_room', { room: `user_${user.id}` });
    console.log('🟢 Joined socket room:', `user_${user.id}`);

    // Listen for deposit confirmations
    socket.on('deposit_confirmed', (data: DepositConfirmedEvent) => {
      console.log('💰 Deposit confirmed:', data);

      // Safely update user's balance (realBalance or testBalance based on network)
      setUser((prev) => {
        if (!prev) return prev;
        
        const updates: any = {};
        
        // Update the appropriate balance based on balanceType
        if (data.balanceType === 'realBalance') {
          updates.realBalance = Number(data.newRealBalance);
          updates.balance = Number(data.newRealBalance);
        } else if (data.balanceType === 'testBalance') {
          updates.testBalance = Number(data.newTestBalance);
          updates.balance = Number(data.newTestBalance);
        } else {
          // Fallback: update both (for backwards compatibility)
          updates.realBalance = Number(data.newRealBalance || data.newBalance);
          updates.testBalance = Number(data.newTestBalance || 0);
          updates.balance = updates.realBalance;
        }
        
        return { ...prev, ...updates };
      });

      // Optional: nice toast message
      toast.success(`Deposit confirmed: +${data.amount} ${data.token}`);
    });

    // Listen for casino balance updates (seamless integration)
    // Note: Casino balance updates are now network-aware
    socket.on('casino_balance_update', (data: CasinoBalanceUpdateEvent) => {
      console.log('🎰 Casino balance update:', data);

      // Update user's balance in real-time based on balanceType from backend
      setUser((prev) => {
        if (!prev) return prev;
        
        const updates: any = {};
        
        // Update the appropriate balance based on balanceType from backend
        if (data.balanceType === 'realBalance') {
          updates.realBalance = Number(data.newBalance);
          updates.balance = updates.realBalance;
        } else if (data.balanceType === 'testBalance') {
          updates.testBalance = Number(data.newBalance);
          updates.balance = updates.testBalance;
        } else {
          // Fallback: update based on active network
          if (activeNetwork === 'mainnet') {
            updates.realBalance = Number(data.newBalance);
            updates.balance = updates.realBalance;
          } else {
            updates.testBalance = Number(data.newBalance);
            updates.balance = updates.testBalance;
          }
        }
        
        return { ...prev, ...updates };
      });

      // Show notification based on transaction type
      // if (data.transactionType === 'debit') {
      //   // Bet placed
      //   toast.info(`Bet placed: -$${data.betAmount.toFixed(2)}`);
      // } else if (data.transactionType === 'credit') {
      //   // Win received
      //   toast.success(`You won: +$${data.winAmount.toFixed(2)}! 🎉`);
      // } else if (data.transactionType === 'debit_credit') {
      //   // Bet and win in one transaction
      //   const net = data.winAmount - data.betAmount;
      //   if (net > 0) {
      //     toast.success(`You won: +$${net.toFixed(2)}! 🎉`);
      //   } else if (net < 0) {
      //     toast.info(`Bet: $${data.betAmount.toFixed(2)}`);
      //   }
      // }
    });

    // Listen for sports bet updates
    socket.on('sports_bet_placed', (data: SportsBetPlacedEvent) => {
      console.log('🏀 Sports bet placed:', data);

      // Update user's balance in real-time (based on network type)
      setUser((prev) => {
        if (!prev) return prev;
        
        const updates: any = {
          realBalance: Number(data.newRealBalance || prev.realBalance),
          testBalance: Number(data.newTestBalance || prev.testBalance),
        };
        
        // Update display balance based on which one changed
        if (data.balanceType === 'testBalance') {
          updates.balance = updates.testBalance;
        } else {
          updates.balance = updates.realBalance;
        }
        
        return { ...prev, ...updates };
      });

      // Show notification
      toast.success(
        `${data.betType === 'parlay' ? 'Parlay' : 'Bet'} placed! -$${data.betAmount.toFixed(2)} | Potential win: $${data.potentialPayout.toFixed(2)}`
      );
    });

    // Listen for withdrawal updates
    socket.on('withdrawal_created', (data: WithdrawalCreatedEvent) => {
      console.log('💸 Withdrawal created:', data);

      // Update user's balance in real-time (based on network type)
      setUser((prev) => {
        if (!prev) return prev;
        
        const updates: any = {
          realBalance: Number(data.newRealBalance || prev.realBalance),
          testBalance: Number(data.newTestBalance || prev.testBalance),
        };
        
        // Update display balance based on which one changed
        if (data.balanceType === 'testBalance') {
          updates.balance = updates.testBalance;
        } else {
          updates.balance = updates.realBalance;
        }
        
        return { ...prev, ...updates };
      });

      // Show notification
      toast.info(
        `Withdrawal initiated: -$${data.amount.toFixed(2)} ${data.token} (Fee: $${data.fee.toFixed(2)})`
      );
    });

    return () => {
      socket.off('deposit_confirmed');
      socket.off('casino_balance_update');
      socket.off('sports_bet_placed');
      socket.off('withdrawal_created');
      socket.disconnect();
    };
  }, [user?.id, activeNetwork]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        setIsLoggedIn(true);
        const user = await fetchUserInfo(token);
        if (user.message === 'Unauthorized') {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          setUser(null);
          return;
        }
        // Use realBalance from user's own account instead of slot aggregator
        user.balance = user.realBalance || 0;
        setUser(user);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const login = async (usernameOrEmail: string, password: string) => {
    try {
      const res = await signin(usernameOrEmail, password);

      // ✅ Successful login
      if (res.access_token) {
        localStorage.setItem('token', res.access_token);
        setIsLoggedIn(true);

        // Fetch user info and use realBalance from user's own account
        const user = await fetchUserInfo(res.access_token);
        user.balance = parseFloat(user.realBalance) || 0;
        setUser(user);

        toast.success('Login successful!');
        return res;
      }

      // ❌ Handle structured backend errors (no token returned)
      if (res?.error) {
        switch (res.error) {
          case 'EMAIL_NOT_VERIFIED':
            toast.warn('Your email is not verified. Please verify before logging in.');
            break;

          case 'INVALID_PASSWORD':
            toast.error('Invalid password. Please try again.');
            break;

          case 'EMAIL_NOT_FOUND':
          case 'USERNAME_NOT_FOUND':
            toast.error('User not found. Please check your credentials.');
            break;

          default:
            toast.error(res.message || 'Login failed. Please try again.');
        }
      } else {
        toast.error('Unexpected response from server.');
      }

      return res;

    } catch (error: any) {
      console.error('Login error:', error);

      // 🧠 Handle network or unexpected server errors
      const message =
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred during login.';

      toast.error(message);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const result = await signup(username, email, password);
      if (result.success) {
        toast.success(result.msg)
      } else {
        toast.error(result.msg || 'Registration failed');
      }
      return result;
    } catch (error) {
      toast.error('Registration failed');
      throw error;
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    try {
      const result = await verifyEmailRequest(email, code);
      if (result.success && result.access_token) {
        localStorage.setItem('token', result.access_token);
        setIsLoggedIn(true);
        const user = await fetchUserInfo(result.access_token);
        // Use realBalance from user's own account (seamless integration)
        user.balance = user.realBalance || 0;
        setUser(user);
        toast.success(result.msg || 'Email verified successfully');
      } else {
        toast.error(result.msg || 'Verification failed');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      toast.error('Email verification failed');
      throw error;
    }
  };

  // ✅ New function to resend verification code
  const resendVerificationCode = async (email: string) => {
    try {
      const result = await resendVerificationRequest(email);
      if (result.success) {
        toast.success(result.msg || 'Verification code resent successfully');
      } else {
        toast.error(result.msg || 'Failed to resend verification code');
      }
    } catch (error) {
      console.error('Resend verification code error:', error);
      toast.error('Failed to resend verification code');
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await forgotPasswordRequest(email);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send reset email');
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await resetPasswordRequest(token, newPassword);
      toast.success('Password reset successful!');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reset password');
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setIsLoggedIn(false);
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const setUserBalance = async (token) => {
    try {
      const user = await fetchUserInfo(token);
      // Set display balance based on active network
      user.balance = activeNetwork === 'mainnet' 
        ? parseFloat(user.realBalance) || 0 
        : parseFloat(user.testBalance) || 0;
      setUser(user);
    } catch (error) {
      console.error('Update user balance error:', error);
      throw error;
    }
  }
  useEffect(() => {
    checkAuth();
  }, []);

  // Update display balance when network changes
  useEffect(() => {
    if (user) {
      setUser(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          balance: activeNetwork === 'mainnet' ? prev.realBalance : prev.testBalance
        };
      });
    }
  }, [activeNetwork]); // Removed 'user' from dependencies to prevent infinite loop

  return (
    <UserContext.Provider
      value={{
        user,
        isLoggedIn,
        login,
        register,
        verifyEmail,
        resendVerificationCode,
        forgotPassword,
        resetPassword,
        setUserBalance,
        logout,
        checkAuth,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
