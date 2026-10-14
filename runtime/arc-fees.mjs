import {uint} from './amounts.mjs';
// Explicit app policy, matching the existing viem 1.2 base-fee margin.
// Default ethers feeData uses a larger ceiling; it is not the user's approved budget.
export function arcFeeQuote(baseFee,priority){baseFee=uint(baseFee);priority=uint(priority);if(baseFee===0n)throw Error('Positive Arc base fee required');return {maxFeePerGas:(baseFee*6n+4n)/5n+priority,maxPriorityFeePerGas:priority};}
export async function arcFees(rpc){const [block,priority]=await Promise.all([rpc.getBlock('latest'),rpc.send('eth_maxPriorityFeePerGas',[])]);if(block.baseFeePerGas==null)throw Error('Arc EIP1559 base fee unavailable');return arcFeeQuote(block.baseFeePerGas,BigInt(priority));}
