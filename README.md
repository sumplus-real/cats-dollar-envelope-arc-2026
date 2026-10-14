# CATS Dollar Envelope

Give an agent a fixed task budget and keep a way to recover the unaccepted amount. CATS Dollar Envelope uses Arc native USDC for both task principal and network fees, with separate app-level fee allowances for the owner and two operators.

**Current release: deployed and exercised on Arc mainnet.** [Contract](https://explorer.arc.io/address/0xb6Dca055363eDC05993E4F834217674144152A0C) · [Live ledger and RPC receipt viewer](https://sumplus-real.github.io/cats-dollar-envelope-arc-2026/live/web/index.html). The fixed demonstration completed 14 actual transactions, independent owner recovery of 0.005 USDC, and B’s independent 0.003 claim. The contract’s final assets are zero. See `evidence/mainnet-rehearsal.json` and `web/envelope.json`. Formal microgrant submission is separate.

## What it does

A root holds 0.010 native USDC. A accepts 0.002 and splits two leaves of 0.004 each. B0 accepts 0.003; B1 keeps 0.004 Offered. The owner can close, release and withdraw the unaccepted 0.005 without either operator. The remaining 0.005 belongs to fixed payees: 0.002 already claimed by A, 0.003 still owed to B. B may independently claim it later, including after expiry. Acceptance does not prove execution, delivery or quality and is irreversible. The service responses in this demonstration are explicit fixtures; no paid model or TEE is involved.

The contract enforces principal limits and fixed acceptance fees. A Dollar Envelope is a versioned local transaction plan: fixed chain, contract, bytecode hash, root, roles, quote digests, principal, per-signer fee limits and transaction caps. Preparing a signature reserves `gasLimit × maxFeePerGas`, plus necessary future and exit fees. Pending and Unknown retain reservations. Successful and reverted receipts record `gasUsed × effectiveGasPrice` and release the unused upper bound. The app verifies the actual signed transaction against the reviewed fields and never blindly retries.

These fee limits govern this app's signing policy, not arbitrary wallet activity. Other applications, fee changes and chain rules can still affect recovery. A local checksum detects accidental edits; it is not a chain commitment, TEE attestation or an unforgeable source of trust.

## Independent recovery and receipt

The downloadable kit contains local HTML/JS, vendored ethers, ABI, deployment configuration and a SHA-256 inventory, without private keys or a CDN. Serve it on an independent local HTTP origin and connect an EIP-1193 wallet. Some wallets do not support `file://`. It checks chain 5042, bytecode hash, fixed owner and live same-block ledger before signing. Owner close/release/withdraw does not invoke a provider or payee. Failed transfers roll back; a blocklisted or rejecting payee may be unable to claim indefinitely while its credit remains intact. Chain/RPC availability, wallet behavior and sufficient Gas remain dependencies.

The receipt checks all 14 fixed-journey transactions against RPC, their input/role/value, canonical blocks, actual fees, and all three signer balance checkpoints. Missing receipts or a missing sender are unverified. `P = free + held + acceptedUnclaimed + acceptedClaimed + ownerWithdrawn`. Parent delegated allocation is history, not another asset. Extra non-budget balance appears as surplus. Other roots are separate assets and cannot block the current owner’s recovery. `Accepted` creates a fee right; `Claimed` pays it out, not a second fee.

Arc native USDC uses 18 decimals. The ERC-20 interface at `0x3600000000000000000000000000000000000000` uses 6 decimals and is the same balance; it truncates the last 12 native decimal places. Never add both views or lose the native remainder. The contract uses native `msg.value` throughout.

## Reproduce locally

Requires Node 20+, Foundry/Solc 0.8.28 and Python or the included static server. Install dependencies with `npm ci --ignore-scripts`. Run `npm test` and `forge test`. Start `anvil --host 127.0.0.1 --port 19142 --chain-id 5042 --silent`, then run `node scripts/rehearse.mjs` for the full local journey. For the browser cold exit, run `node scripts/rehearse.mjs --pause-active`, `node scripts/build-kit.mjs`, then `node scripts/browser-verify.mjs` with Playwright available. `CATS_PLAYWRIGHT_MODULE` and `CATS_CHROMIUM` can point to local installations. The browser test launches isolated Chromium and injects a controlled local fixture EIP-1193 signer; it is **not** proof of an installed wallet extension.

Local keys stay in ignored `.runtime/`, never in the kit. The static server only serves `web/` and `runtime/`. The test stops the main server, starts the kit on another origin with fresh browser storage, performs four owner transactions, then independently claims B's remaining credit. Negative cases include wrong chain, wrong receipt/fee/payee/quote/bytecode, concurrent/Unknown fee reservations, low balance, stale quotes, lost credit and double counting. `CATS_KNOWN_BAD=true forge test --match-test testMachineGuardActualStorageDoubleCredit` intentionally fails after corrupting actual contract storage; the normal test passes.

`mainnet-preflight.mjs` is read-only and creates fresh project-only wallet storage with restrictive permissions. `mainnet-run.mjs` requires an explicit execution flag and a current, specific authorization document outside the repository. It refuses missing approval or a prior journal and always pauses before cold recovery. Never use local/testnet keys on mainnet. Do not submit a local or testnet deployment as mainnet evidence.

## Scope and attribution

Built by Jakob Xu / Sumplus, with AI development assistance. This continues the MIT-licensed CATS SpendPass budget tree and recovery work; the Arc adaptation adds native-USDC accounting, deterministic receipt/event confirmation, signer fee reservations, downloadable recovery and independently reconciled dollar receipts. It has no audit, production safety certification, cryptographic model identity proof or performance benchmark.

MIT. Vendored ethers retains its MIT notice in `web/vendor/THIRD_PARTY_LICENSES.txt`.

Official references: [Arc network](https://docs.arc.io/arc/references/connect-to-arc), [native stablecoin model](https://docs.arc.io/arc/concepts/stablecoin-native-model), [EVM differences](https://docs.arc.io/arc/references/evm-differences), [microgrant requirements](https://community.arc.io/public/events/arc-microgrants-f8tijfjhyq).

## Verified mainnet run (2026-10-14)

Lifecycle Gas: 0.078637744533465711 USDC across all 14 actual receipts. Per-role fees are owner0.055246023184933053, A0.020651401190553210, B0.002740320157979448 USDC. Owner acceptance fees remain irreversible. The independent mainnet exit loaded a frozen Recovery Kit in a fresh Node process after the creator ended. It used no app/operator API or CDN; it is not evidence of an installed browser-wallet extension. The public viewer verifies current code/ledger and recomputes the bill from Arc RPC, with signing disabled.

The kit and public web runtime use an explicit fee policy matching viem’s 1.2 base-fee margin plus live RPC priority. Default ethers feeData’s larger ceiling was caught by the pre-sign guard; no transaction was sent during that failed attempt. Fixed role budgets remain unchanged. `npm test` now covers 32 tests, including funding and fee reserve guards.
