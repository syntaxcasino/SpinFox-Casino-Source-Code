/**
 * Simple test script to verify RPC Manager works
 * Run this with: node test-rpc-manager.js
 */

const axios = require('axios');

// Chain IDs
const CHAIN_IDS = {
  ETHEREUM_SEPOLIA: 11155111,
  OPTIMISM: 10,
  ARBITRUM: 42161,
  BASE: 8453,
};

async function testRPC(rpcUrl, chainId) {
  try {
    console.log(`\nTesting RPC: ${rpcUrl}`);
    
    const response = await axios.post(
      rpcUrl,
      {
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1,
      },
      {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && response.data.result) {
      const actualChainId = parseInt(response.data.result, 16);
      
      if (actualChainId === chainId) {
        console.log(`✅ RPC is working! Chain ID: ${actualChainId}`);
        return true;
      } else {
        console.log(`❌ Chain ID mismatch. Expected: ${chainId}, Got: ${actualChainId}`);
        return false;
      }
    }
    
    console.log('❌ Invalid response from RPC');
    return false;
  } catch (error) {
    console.log(`❌ RPC failed: ${error.message}`);
    return false;
  }
}

async function fetchRPCsFromChainlist(chainId) {
  try {
    console.log(`\n📡 Fetching RPC list from Chainlist for chain ${chainId}...`);
    
    const response = await axios.get('https://chainid.network/chains.json', {
      timeout: 10000,
    });

    const chain = response.data.find((c) => c.chainId === chainId);
    
    if (!chain || !chain.rpc || chain.rpc.length === 0) {
      throw new Error(`No RPC endpoints found for chain ID ${chainId}`);
    }

    // Filter out RPCs that require API keys
    const validRpcs = chain.rpc.filter(
      (rpc) => !rpc.includes('${') && rpc.startsWith('http')
    );

    console.log(`\n📋 Found ${validRpcs.length} public RPCs for ${chain.name}:`);
    validRpcs.forEach((rpc, index) => {
      console.log(`   ${index + 1}. ${rpc}`);
    });

    return { name: chain.name, rpcs: validRpcs };
  } catch (error) {
    console.error(`\n❌ Failed to fetch RPCs: ${error.message}`);
    throw error;
  }
}

async function testChain(chainName, chainId) {
  console.log('\n' + '='.repeat(80));
  console.log(`Testing ${chainName} (Chain ID: ${chainId})`);
  console.log('='.repeat(80));

  try {
    const { name, rpcs } = await fetchRPCsFromChainlist(chainId);
    
    if (rpcs.length === 0) {
      console.log('❌ No public RPCs found');
      return;
    }

    // Test first 3 RPCs
    console.log(`\n🧪 Testing first ${Math.min(3, rpcs.length)} RPCs...`);
    let workingCount = 0;
    
    for (let i = 0; i < Math.min(3, rpcs.length); i++) {
      const isWorking = await testRPC(rpcs[i], chainId);
      if (isWorking) workingCount++;
    }

    console.log(`\n✨ Summary: ${workingCount}/${Math.min(3, rpcs.length)} RPCs are working`);
    
  } catch (error) {
    console.error(`\n❌ Error testing chain: ${error.message}`);
  }
}

async function main() {
  console.log('\n🚀 RPC Manager Test Suite');
  console.log('=' .repeat(80));
  console.log('This script tests fetching and using public RPCs from Chainlist');
  console.log('=' .repeat(80));

  const chains = [
    { name: 'Ethereum Sepolia', id: CHAIN_IDS.ETHEREUM_SEPOLIA },
    { name: 'Optimism', id: CHAIN_IDS.OPTIMISM },
    { name: 'Arbitrum', id: CHAIN_IDS.ARBITRUM },
    { name: 'Base', id: CHAIN_IDS.BASE },
  ];

  for (const chain of chains) {
    await testChain(chain.name, chain.id);
    
    // Add delay between chains to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ Test suite completed!');
  console.log('='.repeat(80));
  console.log('\nYou can now use the RPC Manager in your application.');
  console.log('See RPC_MANAGER_GUIDE.md for usage instructions.\n');
}

// Run the tests
main().catch(console.error);

