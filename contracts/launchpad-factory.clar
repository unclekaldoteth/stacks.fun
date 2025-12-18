;; Launchpad Token Factory
;; Creates new SIP-010 compliant tokens for the launchpad
;; Clarity 4 compatible

;; Constants
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-INVALID-NAME (err u102))
(define-constant ERR-INVALID-SYMBOL (err u103))

;; Contract owner
(define-constant CONTRACT-OWNER tx-sender)

;; Data maps
(define-map tokens
  { token-id: uint }
  {
    name: (string-ascii 32),
    symbol: (string-ascii 10),
    creator: principal,
    bonding-curve: principal,
    created-at: uint,
    image-uri: (optional (string-utf8 256)),
    description: (optional (string-utf8 500)),
    is-graduated: bool
  }
)

(define-map token-by-symbol
  { symbol: (string-ascii 10) }
  { token-id: uint }
)

;; Data variables
(define-data-var next-token-id uint u1)
(define-data-var platform-fee-percent uint u100) ;; 1% = 100 basis points

;; Read-only functions
(define-read-only (get-token-info (token-id uint))
  (map-get? tokens { token-id: token-id })
)

(define-read-only (get-token-by-symbol (symbol (string-ascii 10)))
  (map-get? token-by-symbol { symbol: symbol })
)

(define-read-only (get-next-token-id)
  (var-get next-token-id)
)

(define-read-only (get-platform-fee)
  (var-get platform-fee-percent)
)

;; Public functions

;; Register a new token (called after bonding curve deploys the token)
(define-public (register-token 
  (name (string-ascii 32))
  (symbol (string-ascii 10))
  (bonding-curve principal)
  (image-uri (optional (string-utf8 256)))
  (description (optional (string-utf8 500))))
  (let
    (
      (token-id (var-get next-token-id))
      (caller tx-sender)
    )
    ;; Validate inputs
    (asserts! (> (len name) u0) ERR-INVALID-NAME)
    (asserts! (> (len symbol) u0) ERR-INVALID-SYMBOL)
    
    ;; Check symbol doesn't already exist
    (asserts! (is-none (map-get? token-by-symbol { symbol: symbol })) ERR-ALREADY-EXISTS)
    
    ;; Store token info
    (map-set tokens
      { token-id: token-id }
      {
        name: name,
        symbol: symbol,
        creator: caller,
        bonding-curve: bonding-curve,
        created-at: stacks-block-height,
        image-uri: image-uri,
        description: description,
        is-graduated: false
      }
    )
    
    ;; Store symbol -> token-id mapping
    (map-set token-by-symbol
      { symbol: symbol }
      { token-id: token-id }
    )
    
    ;; Increment token ID
    (var-set next-token-id (+ token-id u1))
    
    ;; Emit event via print
    (print {
      event: "token-created",
      token-id: token-id,
      name: name,
      symbol: symbol,
      creator: caller,
      bonding-curve: bonding-curve
    })
    
    (ok token-id)
  )
)

;; Mark token as graduated (migrated to ALEX DEX)
(define-public (set-graduated (token-id uint))
  (let
    (
      (token-info (unwrap! (map-get? tokens { token-id: token-id }) ERR-NOT-AUTHORIZED))
    )
    ;; Only bonding curve can mark as graduated
    (asserts! (is-eq tx-sender (get bonding-curve token-info)) ERR-NOT-AUTHORIZED)
    
    ;; Update token info
    (map-set tokens
      { token-id: token-id }
      (merge token-info { is-graduated: true })
    )
    
    ;; Emit graduation event
    (print {
      event: "token-graduated",
      token-id: token-id,
      symbol: (get symbol token-info)
    })
    
    (ok true)
  )
)

;; Admin function to update platform fee
(define-public (set-platform-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (<= new-fee u1000) ERR-NOT-AUTHORIZED) ;; Max 10%
    (var-set platform-fee-percent new-fee)
    (ok true)
  )
)
