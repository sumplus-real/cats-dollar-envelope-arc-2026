import {hashTypedData,verifyTypedData} from 'viem';
export const QUOTE_TYPES={Quote:[{name:'grantId',type:'bytes32'},{name:'operator',type:'address'},{name:'payee',type:'address'},{name:'taskInputHash',type:'bytes32'},{name:'modelHash',type:'bytes32'},{name:'fee',type:'uint256'},{name:'expiry',type:'uint256'},{name:'nonce',type:'uint256'},{name:'policyHash',type:'bytes32'},{name:'assetNativeUSDC',type:'address'}]};
export function quoteTypedData(address,q){return {domain:{name:'CATS Dollar Envelope',version:'1',chainId:5042,verifyingContract:address},types:QUOTE_TYPES,primaryType:'Quote',message:{...q,assetNativeUSDC:'0x0000000000000000000000000000000000000000'}};}
export const quoteDigest=(a,q)=>hashTypedData(quoteTypedData(a,q));
export async function signQuote(account,address,q){if(account.address.toLowerCase()!==q.operator.toLowerCase())throw Error('Wrong quote signer');return account.signTypedData(quoteTypedData(address,q));}
export const verifyQuote=(a,q,s)=>verifyTypedData({...quoteTypedData(a,q),address:q.operator,signature:s});
