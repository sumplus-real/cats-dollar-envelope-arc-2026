import assert from 'node:assert/strict';
export const FUNDING = Object.freeze({principal:10000000000000000n, ownerGas:130000000000000000n, A:80000000000000000n, B:30000000000000000n, feeCap:20000000000000000n, total:270000000000000000n});
export function fundingPlan({ownerBalance, balances, estimates, maxFeePerGas, externalFees}) {
  for (const x of [ownerBalance, ...Object.values(balances), ...Object.values(estimates), maxFeePerGas, externalFees]) assert(typeof x==='bigint' && x>=0n,'Unsigned integer funding inputs required');
  assert.equal(balances.A,0n,'A already funded; reconcile before transfer');
  assert.equal(balances.B,0n,'B already funded; reconcile before transfer');
  assert(maxFeePerGas>0n && estimates.A>0n && estimates.B>0n,'Positive live fee and estimates required');
  const transfers=['A','B'].map(role=>({role,value:FUNDING[role],gas:(estimates[role]*125n+99n)/100n}));
  const internalFeeCeiling=transfers.reduce((n,t)=>n+t.gas*maxFeePerGas,0n);
  assert(externalFees+internalFeeCeiling<=FUNDING.feeCap,'Funding fees exceed original 0.02 USDC cap');
  assert(FUNDING.principal+FUNDING.ownerGas+FUNDING.A+FUNDING.B+externalFees+internalFeeCeiling<=FUNDING.total,'Original 0.27 USDC cap exceeded');
  const minimumOwnerBalance=FUNDING.principal+FUNDING.ownerGas+FUNDING.A+FUNDING.B+internalFeeCeiling;
  return {transfers,internalFeeCeiling,externalFees,minimumOwnerBalance,ready:ownerBalance>=minimumOwnerBalance,unallocatedReserve:ownerBalance>minimumOwnerBalance?ownerBalance-minimumOwnerBalance:0n};
}
