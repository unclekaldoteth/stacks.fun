;; Bonding Curve Contract - USDCx Version
;; Implements linear bonding curve for token pricing with USDCx payments
;; Clarity 4 compatible with Stacks testnet/mainnet

;; Traits
(use-trait ft-trait .sip-010-trait.sip-010-trait)

;; Constants
(define-constant ERR-NOT-AUTHORIZED (err u200))
(define-constant ERR-INSUFFICIENT-BALANCE (err u201))
(define-constant ERR-INSUFFICIENT-USDC (err u202))
(define-constant ERR-SLIPPAGE-TOO-HIGH (err u203))
(define-constant ERR-TOKEN-NOT-FOUND (err u204))
(define-constant ERR-ALREADY-GRADUATED (err u205))
(define-constant ERR-NOT-GRADUATED (err u206))
(define-constant ERR-ZERO-AMOUNT (err u207))
(define-constant ERR-TRANSFER-FAILED (err u208))

(define-constant CONTRACT-OWNER tx-sender)

;; USDCx contract addresses
;; For local testing: use the mock contract
;; Testnet: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx
;; Mainnet: SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx  
;; IMPORTANT: Change this to mainnet address before production deployment!
(define-constant USDCX-CONTRACT 'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx)
;; Fixed-point math constants
;; USDCx uses 6 decimals (like native USDC)
;; Tokens use 8 decimals
(define-constant ONE-6 u1000000)     ;; 1.0 in 6-decimal (for USDC)
(define-constant ONE-8 u100000000)   ;; 1.0 in 8-decimal (for tokens)

;; Bonding curve parameters (prices in 6-decimal USDC format)
;; Initial price: 0.0001 USDC per token ($0.0001)
;; At launch: 1 USDC buys ~10,000 tokens
(define-constant INITIAL-PRICE u100)          ;; 0.0001 in 6-decimal = $0.0001/token
(define-constant SLOPE u100)                   ;; Price increase per token sold
(define-constant GRADUATION-THRESHOLD u69000000000) ;; $69,000 USDC market cap (6-decimal)
(define-constant TOTAL-SUPPLY u100000000000000000)  ;; 1 billion tokens (8-decimal)
(define-constant CURVE-SUPPLY u80000000000000000)   ;; 800M tokens on curve (8-decimal)

;; Fee configuration (basis points, 100 = 1%)
(define-constant PLATFORM-FEE u100)   ;; 1%
(define-constant CREATOR-FEE u100)    ;; 1%

;; Data structures
(define-map token-pools
  { token: principal }
  {
    creator: principal,
    tokens-sold: uint,
    usdc-reserve: uint,
    is-graduated: bool,
    created-at: uint
  }
)

(define-map user-balances
  { token: principal, user: principal }
  { balance: uint }
)

;; Data variables
(define-data-var platform-treasury principal CONTRACT-OWNER)

;; Read-only functions

;; Get current price based on tokens sold (linear bonding curve)
;; Returns price in 6-decimal USDC format
(define-read-only (get-current-price (token principal))
  (let
    (
      (pool (unwrap! (map-get? token-pools { token: token }) ERR-TOKEN-NOT-FOUND))
      (tokens-sold (get tokens-sold pool))
    )
    (ok (+ INITIAL-PRICE (/ (* tokens-sold SLOPE) ONE-8)))
  )
)

;; Calculate cost to buy tokens in USDC (6 decimals)
(define-read-only (get-buy-price (token principal) (amount uint))
  (let
    (
      (pool (unwrap! (map-get? token-pools { token: token }) ERR-TOKEN-NOT-FOUND))
      (tokens-sold (get tokens-sold pool))
      (new-tokens-sold (+ tokens-sold amount))
      ;; Cost = integral from tokens-sold to new-tokens-sold
      (base-cost (/ (* INITIAL-PRICE amount) ONE-8))
      (curve-cost (/ (* SLOPE (- (* new-tokens-sold new-tokens-sold) (* tokens-sold tokens-sold))) (* u2 ONE-8 ONE-8)))
    )
    (ok (+ base-cost curve-cost))
  )
)

;; Calculate USDC received for selling tokens
(define-read-only (get-sell-price (token principal) (amount uint))
  (let
    (
      (pool (unwrap! (map-get? token-pools { token: token }) ERR-TOKEN-NOT-FOUND))
      (tokens-sold (get tokens-sold pool))
      (new-tokens-sold (- tokens-sold amount))
      (base-return (/ (* INITIAL-PRICE amount) ONE-8))
      (curve-return (/ (* SLOPE (- (* tokens-sold tokens-sold) (* new-tokens-sold new-tokens-sold))) (* u2 ONE-8 ONE-8)))
    )
    (ok (+ base-return curve-return))
  )
)

(define-read-only (get-pool-info (token principal))
  (map-get? token-pools { token: token })
)

(define-read-only (get-user-balance (token principal) (user principal))
  (default-to { balance: u0 } (map-get? user-balances { token: token, user: user }))
)

(define-read-only (get-market-cap (token principal))
  (let
    (
      (pool (unwrap! (map-get? token-pools { token: token }) ERR-TOKEN-NOT-FOUND))
      (current-price (unwrap! (get-current-price token) ERR-TOKEN-NOT-FOUND))
      (tokens-sold (get tokens-sold pool))
    )
    ;; Market cap in USDC (6 decimals)
    (ok (/ (* current-price tokens-sold) ONE-8))
  )
)

(define-read-only (is-graduated (token principal))
  (match (map-get? token-pools { token: token })
    pool (ok (get is-graduated pool))
    ERR-TOKEN-NOT-FOUND
  )
)

;; Public functions

;; Initialize a new token pool
(define-public (create-pool (token principal) (creator principal))
  (begin
    ;; Check pool doesn't exist
    (asserts! (is-none (map-get? token-pools { token: token })) ERR-NOT-AUTHORIZED)
    
    ;; Create pool
    (map-set token-pools
      { token: token }
      {
        creator: creator,
        tokens-sold: u0,
        usdc-reserve: u0,
        is-graduated: false,
        created-at: stacks-block-height
      }
    )
    
    (print {
      event: "pool-created",
      token: token,
      creator: creator,
      payment-token: "USDCx"
    })
    
    (ok true)
  )
)

;; Buy tokens with USDCx
(define-public (buy (token principal) (usdc-amount uint) (min-tokens uint))
  (let
    (
      (pool (unwrap! (map-get? token-pools { token: token }) ERR-TOKEN-NOT-FOUND))
      (buyer tx-sender)
    )
    ;; Validate
    (asserts! (> usdc-amount u0) ERR-ZERO-AMOUNT)
    (asserts! (not (get is-graduated pool)) ERR-ALREADY-GRADUATED)
    
    ;; Calculate tokens to receive
    (let
      (
        (tokens-sold (get tokens-sold pool))
        (current-price (+ INITIAL-PRICE (/ (* tokens-sold SLOPE) ONE-8)))
        ;; tokens = usdc-amount * ONE-8 / current-price (converting 6-dec to 8-dec)
        (tokens-to-buy (/ (* usdc-amount ONE-8) current-price))
        ;; Calculate fees
        (platform-fee-amount (/ (* usdc-amount PLATFORM-FEE) u10000))
        (creator-fee-amount (/ (* usdc-amount CREATOR-FEE) u10000))
        (net-usdc (- usdc-amount (+ platform-fee-amount creator-fee-amount)))
      )
      ;; Slippage check
      (asserts! (>= tokens-to-buy min-tokens) ERR-SLIPPAGE-TOO-HIGH)
      
      ;; Transfer USDCx from buyer to contract
      (try! (contract-call? USDCX-CONTRACT transfer 
             usdc-amount 
             buyer 
             (as-contract tx-sender) 
             none))
      
      ;; Transfer platform fee
      (try! (as-contract (contract-call? USDCX-CONTRACT transfer 
             platform-fee-amount 
             tx-sender 
             (var-get platform-treasury) 
             none)))
      
      ;; Transfer creator fee
      (try! (as-contract (contract-call? USDCX-CONTRACT transfer 
             creator-fee-amount 
             tx-sender 
             (get creator pool) 
             none)))
      
      ;; Update pool
      (map-set token-pools
        { token: token }
        (merge pool {
          tokens-sold: (+ tokens-sold tokens-to-buy),
          usdc-reserve: (+ (get usdc-reserve pool) net-usdc)
        })
      )
      
      ;; Update user balance
      (let
        (
          (current-balance (get balance (get-user-balance token buyer)))
        )
        (map-set user-balances
          { token: token, user: buyer }
          { balance: (+ current-balance tokens-to-buy) }
        )
      )
      
      ;; Check graduation threshold
      (let
        (
          (new-market-cap (unwrap! (get-market-cap token) ERR-TOKEN-NOT-FOUND))
        )
        (if (>= new-market-cap GRADUATION-THRESHOLD)
          (begin
            (print { event: "graduation-triggered", token: token, market-cap: new-market-cap })
            true
          )
          true
        )
      )
      
      (print {
        event: "buy",
        token: token,
        buyer: buyer,
        usdc-amount: usdc-amount,
        tokens-received: tokens-to-buy
      })
      
      (ok tokens-to-buy)
    )
  )
)

;; Sell tokens for USDCx
(define-public (sell (token principal) (token-amount uint) (min-usdc uint))
  (let
    (
      (pool (unwrap! (map-get? token-pools { token: token }) ERR-TOKEN-NOT-FOUND))
      (seller tx-sender)
      (user-bal (get balance (get-user-balance token seller)))
    )
    ;; Validate
    (asserts! (> token-amount u0) ERR-ZERO-AMOUNT)
    (asserts! (not (get is-graduated pool)) ERR-ALREADY-GRADUATED)
    (asserts! (>= user-bal token-amount) ERR-INSUFFICIENT-BALANCE)
    
    (let
      (
        (tokens-sold (get tokens-sold pool))
        (usdc-reserve (get usdc-reserve pool))
        ;; Calculate USDC to return
        (usdc-return-raw (unwrap! (get-sell-price token token-amount) ERR-TOKEN-NOT-FOUND))
        ;; Calculate fees
        (platform-fee-amount (/ (* usdc-return-raw PLATFORM-FEE) u10000))
        (creator-fee-amount (/ (* usdc-return-raw CREATOR-FEE) u10000))
        (net-usdc-return (- usdc-return-raw (+ platform-fee-amount creator-fee-amount)))
      )
      ;; Slippage check
      (asserts! (>= net-usdc-return min-usdc) ERR-SLIPPAGE-TOO-HIGH)
      (asserts! (>= usdc-reserve usdc-return-raw) ERR-INSUFFICIENT-USDC)
      
      ;; Transfer USDCx to seller
      (try! (as-contract (contract-call? USDCX-CONTRACT transfer 
             net-usdc-return 
             tx-sender 
             seller 
             none)))
      
      ;; Transfer fees
      (try! (as-contract (contract-call? USDCX-CONTRACT transfer 
             platform-fee-amount 
             tx-sender 
             (var-get platform-treasury) 
             none)))
      (try! (as-contract (contract-call? USDCX-CONTRACT transfer 
             creator-fee-amount 
             tx-sender 
             (get creator pool) 
             none)))
      
      ;; Update pool
      (map-set token-pools
        { token: token }
        (merge pool {
          tokens-sold: (- tokens-sold token-amount),
          usdc-reserve: (- usdc-reserve usdc-return-raw)
        })
      )
      
      ;; Update user balance
      (map-set user-balances
        { token: token, user: seller }
        { balance: (- user-bal token-amount) }
      )
      
      (print {
        event: "sell",
        token: token,
        seller: seller,
        tokens-sold: token-amount,
        usdc-received: net-usdc-return
      })
      
      (ok net-usdc-return)
    )
  )
)

;; Mark pool as graduated
(define-public (graduate (token principal))
  (let
    (
      (pool (unwrap! (map-get? token-pools { token: token }) ERR-TOKEN-NOT-FOUND))
    )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (not (get is-graduated pool)) ERR-ALREADY-GRADUATED)
    
    (map-set token-pools
      { token: token }
      (merge pool { is-graduated: true })
    )
    
    (print {
      event: "token-graduated",
      token: token,
      final-usdc-reserve: (get usdc-reserve pool),
      final-tokens-sold: (get tokens-sold pool)
    })
    
    (ok (get usdc-reserve pool))
  )
)

;; Admin: Update treasury address
(define-public (set-treasury (new-treasury principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (var-set platform-treasury new-treasury)
    (ok true)
  )
)
