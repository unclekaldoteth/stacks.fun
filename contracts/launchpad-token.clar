;; Launchpad Token Template
;; SIP-010 compliant fungible token for launchpad
;; This is a template - each launched token will be a copy with custom name/symbol

(impl-trait .sip-010-trait.sip-010-trait)

;; Token configuration (set during deployment)
(define-constant TOKEN-NAME "Launchpad Token")
(define-constant TOKEN-SYMBOL "LAUNCH")
(define-constant TOKEN-DECIMALS u8)
(define-constant TOKEN-URI (some u"https://launchpad.stacks/token/metadata"))

;; Error constants
(define-constant ERR-NOT-AUTHORIZED (err u400))
(define-constant ERR-INSUFFICIENT-BALANCE (err u401))

;; Contract owner (bonding curve contract)
(define-constant CONTRACT-OWNER tx-sender)

;; Define the fungible token
(define-fungible-token launchpad-token)

;; Track total supply
(define-data-var token-total-supply uint u0)

;; Authorized minters (bonding curve)
(define-map authorized-minters principal bool)

;; Initialize the deployer as authorized minter
(map-set authorized-minters CONTRACT-OWNER true)

;; SIP-010 Implementation

(define-read-only (get-name)
  (ok TOKEN-NAME)
)

(define-read-only (get-symbol)
  (ok TOKEN-SYMBOL)
)

(define-read-only (get-decimals)
  (ok TOKEN-DECIMALS)
)

(define-read-only (get-balance (account principal))
  (ok (ft-get-balance launchpad-token account))
)

(define-read-only (get-total-supply)
  (ok (var-get token-total-supply))
)

(define-read-only (get-token-uri)
  (ok TOKEN-URI)
)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    ;; Validate sender is tx-sender or contract-caller
    (asserts! (or (is-eq tx-sender sender) (is-eq contract-caller sender)) ERR-NOT-AUTHORIZED)
    
    ;; Perform transfer
    (try! (ft-transfer? launchpad-token amount sender recipient))
    
    ;; Print memo if provided
    (match memo
      memo-value (begin (print memo-value) true)
      true
    )
    
    (ok true)
  )
)

;; Mint function (only authorized minters - bonding curve)
(define-public (mint (amount uint) (recipient principal))
  (begin
    ;; Check authorization
    (asserts! (default-to false (map-get? authorized-minters tx-sender)) ERR-NOT-AUTHORIZED)
    
    ;; Mint tokens
    (try! (ft-mint? launchpad-token amount recipient))
    
    ;; Update total supply
    (var-set token-total-supply (+ (var-get token-total-supply) amount))
    
    (print {
      event: "mint",
      amount: amount,
      recipient: recipient
    })
    
    (ok true)
  )
)

;; Burn function (token holder can burn their own tokens)
(define-public (burn (amount uint))
  (let
    (
      (sender tx-sender)
    )
    ;; Burn tokens
    (try! (ft-burn? launchpad-token amount sender))
    
    ;; Update total supply
    (var-set token-total-supply (- (var-get token-total-supply) amount))
    
    (print {
      event: "burn",
      amount: amount,
      sender: sender
    })
    
    (ok true)
  )
)

;; Admin: Add authorized minter
(define-public (add-minter (minter principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (map-set authorized-minters minter true)
    (ok true)
  )
)

;; Admin: Remove authorized minter
(define-public (remove-minter (minter principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (map-delete authorized-minters minter)
    (ok true)
  )
)
