import {decodeEventLog,keccak256} from 'viem';
import {uint} from './amounts.mjs';
const same=(a,b)=>typeof a==='string'&&typeof b==='string'&&a.toLowerCase()===b.toLowerCase();
export const ARC={id:5042,name:'Arc',nativeCurrency:{name:'USDC',symbol:'USDC',decimals:18},rpcUrls:{default:{http:['https://rpc.mainnet.arc.io']}},blockExplorers:{default:{name:'Arc Explorer',url:'https://explorer.arc.io'}}};
export async function verifiedAcceptance(client,abi,pin,job){
 if(await client.getChainId()!==5042)throw Error('Arc mainnet chain 5042 required');
 const r=await client.getTransactionReceipt({hash:job.hash});
 if(!same(r.transactionHash,job.hash)||!same(r.to,pin.contract)||r.status!=='success')throw Error('Receipt identity/status mismatch');
 const block=await client.getBlock({blockNumber:r.blockNumber});if(!same(block.hash,r.blockHash))throw Error('Canonical block mismatch');
 const code=await client.getCode({address:pin.contract,blockNumber:r.blockNumber});if(!code||code==='0x'||!same(keccak256(code),pin.codeHash))throw Error('Deployment code mismatch');
 const event=r.logs.find(l=>{try{const e=decodeEventLog({abi,data:l.data,topics:l.topics});return same(l.address,pin.contract)&&e.eventName==='Accepted'&&same(e.args.grantId,job.grantId)&&same(e.args.payee,job.payee)&&uint(e.args.fee)===uint(job.fee);}catch{return false;}});
 if(!event)throw Error('Matching Accepted event absent');
 const read=(functionName,args)=>client.readContract({address:pin.contract,abi,functionName,args,blockNumber:r.blockNumber});
 const [offer,grant]=await Promise.all([read('offers',[job.grantId]),read('grants',[job.grantId])]);
 if(Number(offer[0])!==2||!same(offer[1],job.operator)||!same(offer[2],job.payee)||uint(offer[3])!==uint(job.fee)||!same(offer[5],job.quoteDigest)||uint(grant[4])+uint(grant[5])<uint(job.fee))throw Error('Same-block fee entitlement mismatch');
 if(!same(await read('policyHash',[grant[0]]),job.policyHash))throw Error('Same-block policy mismatch');
 if(!same((await client.getBlock({blockNumber:r.blockNumber})).hash,r.blockHash))throw Error('Canonical block changed');
 return {chainId:5042,receipt:r,blockNumber:r.blockNumber,blockHash:r.blockHash,accepted:true,serviceDelivered:false};
}
