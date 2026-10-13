export const NATIVE_DECIMALS=18, ERC20_DECIMALS=6;
export function uint(x){if(typeof x==='bigint'&&x>=0n)return x;if(typeof x==='string'&&/^(0|[1-9][0-9]*)$/.test(x))return BigInt(x);throw Error('Nonnegative integer bigint or decimal string required');}
export function parseUSDC(x){if(typeof x!=='string'||!/^\d+(\.\d{1,18})?$/.test(x))throw Error('Native USDC decimal string, at most 18 places required');const [a,b='']=x.split('.');return BigInt(a)*10n**18n+BigInt(b.padEnd(18,'0'));}
export function formatUSDC(x){const n=uint(x),a=n/10n**18n,b=(n%10n**18n).toString().padStart(18,'0').replace(/0+$/,'');return a+'.'+(b||'00');}
export function nativeAndERC20(native,erc20){native=uint(native);erc20=uint(erc20);if(native/10n**12n!==erc20)throw Error('Native/ERC20 same-balance comparison failed');return {nativeWei:native.toString(),erc20Units:erc20.toString(),nativeRemainderWei:(native%10n**12n).toString(),sameBalance:true};}
export function exactDeposit(value,expected){if(uint(value)!==uint(expected))throw Error('Deposit differs from native18 principal');return true;}
