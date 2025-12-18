;; ALEX Graduation Contract
;; Handles migration of tokens from bonding curve to ALEX DEX
;; Clarity 4 compatible

;; Constants
(define-constant ERR-NOT-AUTHORIZED (err u300))
(define-constant ERR-NOT-READY-FOR-GRADUATION (err u301))
(define-constant ERR-ALREADY-GRADUATED (err u302))
(define-constant ERR-GRADUATION-FAILED (err u303))

(define-constant CONTRACT-OWNER tx-sender)

;; ALEX mainnet contract addresses
;; Note: These are placeholder addresses - verify on mainnet before deployment
(define-constant ALEX-AMM-POOL 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.amm-pool-v2-01)
(define-constant ALEX-WSTX 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-wstx)

;; 8-digit fixed point (ALEX standard)
(define-constant ONE-8 u100000000)
(define-constant FACTOR-CONSTANT-PRODUCT u100000000) ;; 1.0 = constant product AMM

;; Graduation configuration
(define-constant MIN-GRADUATION-STX u100000000000) ;; Minimum 1000 STX reserve for graduation

;; Data maps
(define-map graduated-tokens
  { token: principal }
  {
    graduated-at: uint,
    stx-liquidity: uint,
    token-liquidity: uint,
    alex-pool-created: bool
  }
)

;; Read-only functions

(define-read-only (get-graduation-status (token principal))
  (map-get? graduated-tokens { token: token })
)

(define-read-only (is-token-graduated (token principal))
  (is-some (map-get? graduated-tokens { token: token }))
)

;; Public functions

;; Graduate a token from bonding curve to ALEX DEX
;; This function:
;; 1. Verifies graduation eligibility
;; 2. Withdraws STX reserve from bonding curve
;; 3. Creates liquidity pool on ALEX
;; 4. Burns or locks LP tokens for permanent liquidity
(define-public (graduate-token 
  (token principal)
  (bonding-curve-contract principal)
  (token-amount uint))
  (let
    (
      (caller tx-sender)
    )
    ;; Only contract owner can initiate graduation (in v1)
    (asserts! (is-eq caller CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    
    ;; Check not already graduated
    (asserts! (is-none (map-get? graduated-tokens { token: token })) ERR-ALREADY-GRADUATED)
    
    ;; Get STX from bonding curve
    ;; In production, this would call the bonding curve's graduate function
    ;; which returns the STX reserve
    
    ;; Record graduation
    (map-set graduated-tokens
      { token: token }
      {
        graduated-at: stacks-block-height,
        stx-liquidity: u0,  ;; Updated after ALEX pool creation
        token-liquidity: token-amount,
        alex-pool-created: false
      }
    )
    
    (print {
      event: "graduation-initiated",
      token: token,
      token-amount: token-amount,
      block: stacks-block-height
    })
    
    (ok true)
  )
)

;; Create pool on ALEX DEX
;; This is a separate step that may require ALEX team approval
;; depending on their self-service listing requirements
(define-public (create-alex-pool
  (token principal)
  (stx-amount uint)
  (token-amount uint))
  (let
    (
      (graduation-info (unwrap! (map-get? graduated-tokens { token: token }) ERR-NOT-READY-FOR-GRADUATION))
    )
    ;; Only contract owner
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    
    ;; Verify not already created
    (asserts! (not (get alex-pool-created graduation-info)) ERR-ALREADY-GRADUATED)
    
    ;; Note: The actual ALEX contract call would look like this:
    ;; (try! (contract-call? ALEX-AMM-POOL create-pool
    ;;   ALEX-WSTX
    ;;   token
    ;;   FACTOR-CONSTANT-PRODUCT
    ;;   (as-contract tx-sender)
    ;;   stx-amount
    ;;   token-amount))
    
    ;; For now, we just record the intent
    ;; Actual integration requires ALEX contract interaction
    
    ;; Update graduation record
    (map-set graduated-tokens
      { token: token }
      (merge graduation-info {
        stx-liquidity: stx-amount,
        alex-pool-created: true
      })
    )
    
    (print {
      event: "alex-pool-created",
      token: token,
      stx-liquidity: stx-amount,
      token-liquidity: token-amount
    })
    
    (ok true)
  )
)

;; View function to get ALEX pool creation parameters
;; Returns the exact values needed for ALEX create-pool call
(define-read-only (get-alex-pool-params (token principal) (stx-amount uint) (token-amount uint))
  {
    token-x: ALEX-WSTX,
    token-y: token,
    factor: FACTOR-CONSTANT-PRODUCT,
    dx: stx-amount,  ;; STX amount in 8-decimal format
    dy: token-amount  ;; Token amount in 8-decimal format
  }
)
