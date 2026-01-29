---
status: testing
phase: 03-wallet-integration
source: [03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md]
started: 2026-01-28T22:30:00Z
updated: 2026-01-28T22:30:00Z
---

## Current Test

number: 2
name: Connected Wallet Display
expected: |
  After selecting a wallet, the navbar shows a button with your truncated address (e.g., "SP2J...3DGC"). Click it to open the wallet dropdown.
awaiting: user response

## Tests

### 1. Devnet Wallet Selection
expected: Click Connect button shows dropdown with 6 test wallets. Selecting one closes the dropdown.
result: pass

### 2. Connected Wallet Display
expected: After selecting a wallet, the navbar shows a button with your truncated address (e.g., "SP2J...3DGC"). Click it to open the wallet dropdown.
result: [pending]

### 3. Copy Address to Clipboard
expected: In the wallet dropdown, click "Copy Address". A toast notification appears confirming the address was copied. The full address is now in your clipboard.
result: [pending]

### 4. Disconnect Wallet
expected: In the wallet dropdown, click "Disconnect". The navbar returns to showing the "Connect" button. Wallet state is cleared.
result: [pending]

### 5. Network Indicator
expected: The NetworkIndicator badge in the page shows "Devnet" (reflecting the current network from wallet context).
result: [pending]

### 6. Theme Toggle
expected: Click the theme toggle (sun/moon icon). The theme switches between light and dark mode immediately on first click - no need to click twice.
result: [pending]

## Summary

total: 6
passed: 0
issues: 0
pending: 6
skipped: 0

## Gaps

[none yet]
