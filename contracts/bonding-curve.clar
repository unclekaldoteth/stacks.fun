;; Bonding Curve Contract
;; Implements linear bonding curve for token pricing
;; Clarity 4 compatible with Stacks mainnet

;; Traits
(use-trait ft-trait .sip-010-trait.sip-010-trait)

;; Constants
(define-constant ERR-NOT-AUTHORIZED (err u200))
(define-constant ERR-INSUFFICIENT-BALANCE (err u201))
(define-constant ERR-INSUFFICIENT-STX (err u202))
(define-constant ERR-SLIPPAGE-TOO-HIGH (err u203))
(define-constant ERR-TOKEN-NOT-FOUND (err u204))
(define-constant ERR-ALREADY-GRADUATED (err u205))
(define-constant ERR-NOT-GRADUATED (err u206))
(define-constant ERR-ZERO-AMOUNT (err u207))

(define-constant CONTRACT-OWNER tx-sender)

;; Fixed-point math constants (8 decimals like ALEX)
(define-constant ONE-8 u100000000) ;; 1.0 in 8-decimal fixed point

;; Bonding curve parameters
(define-constant INITIAL-PRICE u1000000)        ;; 0.01 STX per token (in 8-decimal)
(define-constant SLOPE u100)                     ;; Price increase per token sold
(define-constant GRADUATION-THRESHOLD u6900000000000) ;; ~69,000 STX market cap (8-decimal)
(define-constant TOTAL-SUPPLY u100000000000000000) ;; 1 billion tokens (8-decimal)
(define-constant CURVE-SUPPLY u80000000000000000)  ;; 800M tokens on curve (8-decimal)

;; Fee configuration (basis points, 100 = 1%)
(define-constant PLATFORM-FEE u100)   ;; 1%
(define-constant CREATOR-FEE u100)    ;; 1%

;; Data structures
(define-map token-pools
  { token: principal }
  {
    creator: principal,
    tokens-sold: uint,
    stx-reserve: uint,
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
(define-read-only (get-current-price (token principal))
  (let
    (
      (pool (unwrap! (map-get? token-pools { token: token }) ERR-TOKEN-NOT-FOUND))
      (tokens-sold (get tokens-sold pool))
    )
    (ok (+ INITIAL-PRICE (* tokens-sold SLOPE)))
  )
)

;; Calculate cost to buy tokens (integral of linear curve)
(define-read-only (get-buy-price (token principal) (amount uint))
  (let
    (
      (pool (unwrap! (map-get? token-pools { token: token }) ERR-TOKEN-NOT-FOUND))
      (tokens-sold (get tokens-sold pool))
      (new-tokens-sold (+ tokens-sold amount))
      ;; Cost = integral from tokens-sold to new-tokens-sold
      ;; = INITIAL-PRICE * amount + SLOPE * (new^2 - old^2) / 2
      (base-cost (* INITIAL-PRICE amount))
      (curve-cost (/ (* SLOPE (- (* new-tokens-sold new-tokens-sold) (* tokens-sold tokens-sold))) u2))
    )
    (ok (+ base-cost curve-cost))
  )
)

;; Calculate STX received for selling tokens
(define-read-only (get-sell-price (token principal) (amount uint))
  (let
    (
      (pool (unwrap! (map-get? token-pools { token: token }) ERR-TOKEN-NOT-FOUND))
      (tokens-sold (get tokens-sold pool))
      (new-tokens-sold (- tokens-sold amount))
      (base-return (* INITIAL-PRICE amount))
      (curve-return (/ (* SLOPE (- (* tokens-sold tokens-sold) (* new-tokens-sold new-tokens-sold))) u2))
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
    (ok (* current-price tokens-sold))
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
        stx-reserve: u0,
        is-graduated: false,
        created-at: stacks-block-height
      }
    )
    
    (print {
      event: "pool-created",
      token: token,
      creator: creator
    })
    
    (ok true)
  )
)

;; Buy tokens with STX
(define-public (buy (token principal) (stx-amount uint) (min-tokens uint))
  (let
    (
      (pool (unwrap! (map-get? token-pools { token: token }) ERR-TOKEN-NOT-FOUND))
      (buyer tx-sender)
    )
    ;; Validate
    (asserts! (> stx-amount u0) ERR-ZERO-AMOUNT)
    (asserts! (not (get is-graduated pool)) ERR-ALREADY-GRADUATED)
    
    ;; Calculate tokens to receive
    (let
      (
        (tokens-sold (get tokens-sold pool))
        (current-price (+ INITIAL-PRICE (* tokens-sold SLOPE)))
        ;; Simplified: tokens = stx-amount / current-price
        (tokens-to-buy (/ (* stx-amount ONE-8) current-price))
        ;; Calculate fees
        (platform-fee-amount (/ (* stx-amount PLATFORM-FEE) u10000))
        (creator-fee-amount (/ (* stx-amount CREATOR-FEE) u10000))
        (net-stx (- stx-amount (+ platform-fee-amount creator-fee-amount)))
      )
      ;; Slippage check
      (asserts! (>= tokens-to-buy min-tokens) ERR-SLIPPAGE-TOO-HIGH)
      
      ;; Transfer STX from buyer
      (try! (stx-transfer? stx-amount buyer (as-contract tx-sender)))
      
      ;; Transfer platform fee
      (try! (as-contract (stx-transfer? platform-fee-amount tx-sender (var-get platform-treasury))))
      
      ;; Transfer creator fee
      (try! (as-contract (stx-transfer? creator-fee-amount tx-sender (get creator pool))))
      
      ;; Update pool
      (map-set token-pools
        { token: token }
        (merge pool {
          tokens-sold: (+ tokens-sold tokens-to-buy),
          stx-reserve: (+ (get stx-reserve pool) net-stx)
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
            ;; Mark as ready for graduation (actual DEX migration happens separately)
            true
          )
          true
        )
      )
      
      (print {
        event: "buy",
        token: token,
        buyer: buyer,
        stx-amount: stx-amount,
        tokens-received: tokens-to-buy
      })
      
      (ok tokens-to-buy)
    )
  )
)

;; Sell tokens for STX
(define-public (sell (token principal) (token-amount uint) (min-stx uint))
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
        (stx-reserve (get stx-reserve pool))
        ;; Calculate STX to return
        (stx-return-raw (unwrap! (get-sell-price token token-amount) ERR-TOKEN-NOT-FOUND))
        ;; Calculate fees
        (platform-fee-amount (/ (* stx-return-raw PLATFORM-FEE) u10000))
        (creator-fee-amount (/ (* stx-return-raw CREATOR-FEE) u10000))
        (net-stx-return (- stx-return-raw (+ platform-fee-amount creator-fee-amount)))
      )
      ;; Slippage check
      (asserts! (>= net-stx-return min-stx) ERR-SLIPPAGE-TOO-HIGH)
      (asserts! (>= stx-reserve stx-return-raw) ERR-INSUFFICIENT-STX)
      
      ;; Transfer STX to seller
      (try! (as-contract (stx-transfer? net-stx-return tx-sender seller)))
      
      ;; Transfer fees
      (try! (as-contract (stx-transfer? platform-fee-amount tx-sender (var-get platform-treasury))))
      (try! (as-contract (stx-transfer? creator-fee-amount tx-sender (get creator pool))))
      
      ;; Update pool
      (map-set token-pools
        { token: token }
        (merge pool {
          tokens-sold: (- tokens-sold token-amount),
          stx-reserve: (- stx-reserve stx-return-raw)
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
        stx-received: net-stx-return
      })
      
      (ok net-stx-return)
    )
  )
)

;; Mark pool as graduated (only callable by graduation contract)
(define-public (graduate (token principal))
  (let
    (
      (pool (unwrap! (map-get? token-pools { token: token }) ERR-TOKEN-NOT-FOUND))
    )
    ;; Only contract owner or dedicated graduation contract can graduate
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (not (get is-graduated pool)) ERR-ALREADY-GRADUATED)
    
    (map-set token-pools
      { token: token }
      (merge pool { is-graduated: true })
    )
    
    (print {
      event: "token-graduated",
      token: token,
      final-stx-reserve: (get stx-reserve pool),
      final-tokens-sold: (get tokens-sold pool)
    })
    
    (ok (get stx-reserve pool))
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
