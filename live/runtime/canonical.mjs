import {keccak256,toUtf8Bytes} from '../web/vendor/ethers-6.17.0.min.mjs';
export function canonical(x){if(typeof x==='bigint')return JSON.stringify(x.toString());if(x===null||typeof x==='string'||typeof x==='boolean')return JSON.stringify(x);if(typeof x==='number'){if(!Number.isSafeInteger(x))throw Error('Unsafe manifest number');return JSON.stringify(x);}if(Array.isArray(x))return '['+x.map(canonical).join(',')+']';if(x&&typeof x==='object')return '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}';throw Error('Unsupported canonical value');}
export const digest=x=>keccak256(toUtf8Bytes(canonical(x)));
export function seal(x){return {...x,digest:digest(x)};}
export function checkSeal(x){const {digest:expected,...body}=x;if(!expected||digest(body)!==expected)throw Error('Manifest digest mismatch');return body;}
