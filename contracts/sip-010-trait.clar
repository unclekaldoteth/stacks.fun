;; SIP-010 Trait Definition
;; Standard trait for fungible tokens on Stacks

(define-trait sip-010-trait
  (
    ;; Transfer tokens from sender to recipient
    (transfer (uint principal principal (optional (buff 34))) (response bool uint))
    
    ;; Get the token name
    (get-name () (response (string-ascii 32) uint))
    
    ;; Get the token symbol
    (get-symbol () (response (string-ascii 10) uint))
    
    ;; Get the number of decimals
    (get-decimals () (response uint uint))
    
    ;; Get the balance of a principal
    (get-balance (principal) (response uint uint))
    
    ;; Get the total supply
    (get-total-supply () (response uint uint))
    
    ;; Get the token URI for metadata
    (get-token-uri () (response (optional (string-utf8 256)) uint))
  )
)
