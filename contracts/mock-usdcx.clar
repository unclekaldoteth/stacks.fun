;; Mock USDCx token for local testing
;; This mimics the SIP-010 interface of the USDCx contract

(impl-trait .sip-010-trait.sip-010-trait)

;; Token configuration
(define-constant TOKEN-NAME "USDCx Mock")
(define-constant TOKEN-SYMBOL "USDCx")
(define-constant TOKEN-DECIMALS u6)
(define-constant TOKEN-URI (some u"https://docs.stacks.co/learn/bridging/usdcx"))

;; Error constants
(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-INSUFFICIENT-BALANCE (err u402))

;; Contract owner
(define-constant CONTRACT-OWNER tx-sender)

;; Define the fungible token
(define-fungible-token usdcx)

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
  (ok (ft-get-balance usdcx account))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply usdcx))
)

(define-read-only (get-token-uri)
  (ok TOKEN-URI)
)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    ;; Validate sender is tx-sender or contract-caller
    (asserts! (or (is-eq tx-sender sender) (is-eq contract-caller sender)) ERR-NOT-AUTHORIZED)
    
    ;; Perform transfer
    (try! (ft-transfer? usdcx amount sender recipient))
    
    ;; Print memo if provided
    (match memo
      memo-value (begin (print memo-value) true)
      true
    )
    
    (ok true)
  )
)

;; Mint function for testing (faucet-like)
(define-public (mint (amount uint) (recipient principal))
  (begin
    ;; For testing, anyone can mint
    (try! (ft-mint? usdcx amount recipient))
    (ok true)
  )
)

;; Burn function
(define-public (burn (amount uint))
  (begin
    (try! (ft-burn? usdcx amount tx-sender))
    (ok true)
  )
)
