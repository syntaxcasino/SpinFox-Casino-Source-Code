import AgentFactoryAbi from './AgentFactoryAbi.json';
import CCIPReceiverAbi from './CCIPReceiverAbi.json';
import ERC20AgentAbi from './ERC20AgentAbi.json';
import ETHAgentAbi from './ETHAgentAbi.json';
import GambitAbi from './GambitAbi.json';
import GambitV2Abi from './Gambitv2Abi.json';
import NewGambitAbi from './NewGambitAbi.json';
import propsBetContractAbi from './propsBetContractAbi.json';

export const SportsGambitABI = GambitAbi;
export const NewSportsGambitABI = NewGambitAbi;
export const CCIPReceiverABI = CCIPReceiverAbi;
export const propsBetContractABI = propsBetContractAbi;
export const GambitV2ABI = GambitV2Abi;
export const AgentFactoryABI = AgentFactoryAbi;
export const ETHAgentABI = ETHAgentAbi;
export const ERC20AgentABI = ERC20AgentAbi;

export const ERC20_ABI = [
  'function transfer(address to, uint256 amount) public returns (bool)',
  'function balanceOf(address account) public view returns (uint256)',
  'function decimals() public view returns (uint8)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
];
