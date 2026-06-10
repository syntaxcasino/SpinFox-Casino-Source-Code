/**
 * Example usage of RPC Manager
 * This file demonstrates how to use the RPC manager to get RPC endpoints from Chainlist
 * and automatically rotate through them when one fails.
 */

import { rpcManager, CHAIN_IDS, getSepoliaRPC } from './rpc-manager';
import { ethers } from 'ethers';

/**
 * Example 1: Get RPC for Ethereum Sepolia
 */
async function example1() {
  console.log('Example 1: Get RPC for Ethereum Sepolia');
  
  const rpcUrl = await getSepoliaRPC();
  console.log('RPC URL:', rpcUrl);
  
  // Use it with ethers
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const blockNumber = await provider.getBlockNumber();
  console.log('Current block:', blockNumber);
}

/**
 * Example 2: Get RPC with automatic rotation
 */
async function example2() {
  console.log('\nExample 2: Get RPC with automatic rotation');
  
  // First call - gets the first available RPC
  const rpc1 = await rpcManager.getRPC(CHAIN_IDS.ETHEREUM_SEPOLIA);
  console.log('First RPC:', rpc1);
  
  // Second call - automatically rotates to next RPC
  const rpc2 = await rpcManager.getRPC(CHAIN_IDS.ETHEREUM_SEPOLIA);
  console.log('Second RPC:', rpc2);
  
  // Third call - continues rotation
  const rpc3 = await rpcManager.getRPC(CHAIN_IDS.ETHEREUM_SEPOLIA);
  console.log('Third RPC:', rpc3);
}

/**
 * Example 3: Get multiple working RPCs for fallback
 */
async function example3() {
  console.log('\nExample 3: Get multiple working RPCs');
  
  const workingRpcs = await rpcManager.getWorkingRPCs(CHAIN_IDS.ETHEREUM_SEPOLIA, 3);
  console.log('Working RPCs:', workingRpcs);
}

/**
 * Example 4: Use custom RPC list
 */
async function example4() {
  console.log('\nExample 4: Set custom RPC list');
  
  const customRpcs = [
    'https://rpc.sepolia.org',
    'https://eth-sepolia.public.blastapi.io',
    'https://ethereum-sepolia.blockpi.network/v1/rpc/public',
  ];
  
  rpcManager.setCustomRPCs(CHAIN_IDS.ETHEREUM_SEPOLIA, customRpcs);
  
  const rpc = await rpcManager.getRPC(CHAIN_IDS.ETHEREUM_SEPOLIA, false); // false = don't test
  console.log('Custom RPC:', rpc);
  
  // Clear custom RPCs
  rpcManager.clearCache(CHAIN_IDS.ETHEREUM_SEPOLIA);
}

/**
 * Example 5: Handle RPC failures with retry logic
 */
async function example5() {
  console.log('\nExample 5: RPC with retry logic');
  
  async function getProviderWithRetry(chainId: number, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const rpcUrl = await rpcManager.getRPC(chainId);
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        
        // Test the connection
        await provider.getBlockNumber();
        
        console.log(`Connected to RPC: ${rpcUrl}`);
        return provider;
      } catch (error) {
        console.log(`Attempt ${i + 1} failed, trying next RPC...`);
        
        if (i === maxRetries - 1) {
          throw new Error('All RPC attempts failed');
        }
      }
    }
  }
  
  const provider = await getProviderWithRetry(CHAIN_IDS.ETHEREUM_SEPOLIA);
  console.log('Successfully connected to provider');
}

/**
 * Example 6: Using RPC manager for different chains
 */
async function example6() {
  console.log('\nExample 6: Multiple chains');
  
  const chains = [
    { name: 'Ethereum Mainnet', id: CHAIN_IDS.ETHEREUM_MAINNET },
    { name: 'Ethereum Sepolia', id: CHAIN_IDS.ETHEREUM_SEPOLIA },
    { name: 'Optimism', id: CHAIN_IDS.OPTIMISM },
    { name: 'Arbitrum', id: CHAIN_IDS.ARBITRUM },
    { name: 'Base', id: CHAIN_IDS.BASE },
  ];
  
  for (const chain of chains) {
    try {
      const rpc = await rpcManager.getRPC(chain.id);
      console.log(`${chain.name}: ${rpc}`);
    } catch (error) {
      console.error(`Failed to get RPC for ${chain.name}:`, error.message);
    }
  }
}

// Run examples
async function runExamples() {
  try {
    await example1();
    await example2();
    await example3();
    await example4();
    await example5();
    await example6();
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Uncomment to run
// runExamples();

