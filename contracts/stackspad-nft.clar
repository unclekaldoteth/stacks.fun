;; StacksPad NFT Launchpad Contract
;; SIP-009 NFT Standard Implementation with Launchpad Features

;; Traits
(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-NOT-FOUND (err u101))
(define-constant ERR-SOLD-OUT (err u102))
(define-constant ERR-MINT-NOT-STARTED (err u103))
(define-constant ERR-MINT-ENDED (err u104))
(define-constant ERR-WRONG-PRICE (err u105))
(define-constant ERR-NOT-WHITELISTED (err u106))
(define-constant ERR-ALREADY-MINTED (err u107))
(define-constant ERR-PACK-NOT-REVEALED (err u108))
(define-constant ERR-PACK-ALREADY-REVEALED (err u109))
(define-constant ERR-MAX-PER-WALLET (err u110))

;; Data Variables
(define-data-var token-name (string-ascii 32) "StacksPad Collection")
(define-data-var token-symbol (string-ascii 10) "SPAD")
(define-data-var base-uri (string-utf8 200) u"https://api.stackspad.io/metadata/")
(define-data-var last-token-id uint u0)
(define-data-var max-supply uint u10000)
(define-data-var mint-price uint u50000000) ;; 50 STX in micro-STX
(define-data-var mint-start-block uint u0)
(define-data-var mint-end-block uint u999999999)
(define-data-var is-whitelist-only bool true)
(define-data-var max-per-wallet uint u5)
(define-data-var is-revealed bool false)
(define-data-var unrevealed-uri (string-utf8 200) u"https://api.stackspad.io/unrevealed.json")
(define-data-var treasury principal CONTRACT-OWNER)

;; Data Maps
(define-map token-owners uint principal)
(define-map token-uris uint (string-utf8 200))
(define-map whitelist principal bool)
(define-map wallet-mints principal uint)
(define-map pack-contents uint (list 5 uint)) ;; Pack can contain up to 5 NFTs

;; NFT Definition
(define-non-fungible-token stackspad-nft uint)

;; SIP-009 Functions

;; Get last token ID
(define-read-only (get-last-token-id)
    (ok (var-get last-token-id))
)

;; Get token URI
(define-read-only (get-token-uri (token-id uint))
    (if (var-get is-revealed)
        (ok (some (default-to (var-get base-uri) (map-get? token-uris token-id))))
        (ok (some (var-get unrevealed-uri)))
    )
)

;; Get owner
(define-read-only (get-owner (token-id uint))
    (ok (nft-get-owner? stackspad-nft token-id))
)

;; Transfer
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
    (begin
        (asserts! (is-eq tx-sender sender) ERR-NOT-AUTHORIZED)
        (nft-transfer? stackspad-nft token-id sender recipient)
    )
)

;; Launchpad Functions

;; Check if address is whitelisted
(define-read-only (is-whitelisted (address principal))
    (default-to false (map-get? whitelist address))
)

;; Get wallet mint count
(define-read-only (get-wallet-mints (address principal))
    (default-to u0 (map-get? wallet-mints address))
)

;; Get mint info
(define-read-only (get-mint-info)
    {
        price: (var-get mint-price),
        max-supply: (var-get max-supply),
        minted: (var-get last-token-id),
        remaining: (- (var-get max-supply) (var-get last-token-id)),
        start-block: (var-get mint-start-block),
        end-block: (var-get mint-end-block),
        is-whitelist-only: (var-get is-whitelist-only),
        max-per-wallet: (var-get max-per-wallet),
        is-revealed: (var-get is-revealed)
    }
)

;; Check if mint is active
(define-read-only (is-mint-active)
    (and
        (>= block-height (var-get mint-start-block))
        (<= block-height (var-get mint-end-block))
        (< (var-get last-token-id) (var-get max-supply))
    )
)

;; Mint single NFT
(define-public (mint)
    (let
        (
            (new-token-id (+ (var-get last-token-id) u1))
            (current-mints (get-wallet-mints tx-sender))
        )
        ;; Check mint conditions
        (asserts! (>= block-height (var-get mint-start-block)) ERR-MINT-NOT-STARTED)
        (asserts! (<= block-height (var-get mint-end-block)) ERR-MINT-ENDED)
        (asserts! (<= new-token-id (var-get max-supply)) ERR-SOLD-OUT)
        (asserts! (< current-mints (var-get max-per-wallet)) ERR-MAX-PER-WALLET)
        
        ;; Check whitelist if in whitelist-only mode
        (if (var-get is-whitelist-only)
            (asserts! (is-whitelisted tx-sender) ERR-NOT-WHITELISTED)
            true
        )
        
        ;; Transfer payment
        (try! (stx-transfer? (var-get mint-price) tx-sender (var-get treasury)))
        
        ;; Mint NFT
        (try! (nft-mint? stackspad-nft new-token-id tx-sender))
        
        ;; Update state
        (var-set last-token-id new-token-id)
        (map-set token-owners new-token-id tx-sender)
        (map-set wallet-mints tx-sender (+ current-mints u1))
        
        (ok new-token-id)
    )
)

;; Mint multiple NFTs (up to 5 at once)
(define-public (mint-multiple (amount uint))
    (begin
        (asserts! (<= amount u5) (err u111)) ;; Max 5 per transaction
        (fold mint-one (list u1 u2 u3 u4 u5) (ok u0))
    )
)

;; Helper for batch minting
(define-private (mint-one (n uint) (acc (response uint uint)))
    (match acc
        success (if (< success n) (mint) (ok success))
        error (err error)
    )
)

;; Admin Functions

;; Add to whitelist (batch)
(define-public (add-to-whitelist (addresses (list 100 principal)))
    (begin
        (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
        (ok (map add-whitelist-single addresses))
    )
)

(define-private (add-whitelist-single (address principal))
    (map-set whitelist address true)
)

;; Remove from whitelist
(define-public (remove-from-whitelist (address principal))
    (begin
        (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
        (ok (map-delete whitelist address))
    )
)

;; Set whitelist mode
(define-public (set-whitelist-only (enabled bool))
    (begin
        (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
        (ok (var-set is-whitelist-only enabled))
    )
)

;; Set mint price
(define-public (set-mint-price (price uint))
    (begin
        (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
        (ok (var-set mint-price price))
    )
)

;; Set mint window
(define-public (set-mint-window (start-block uint) (end-block uint))
    (begin
        (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
        (var-set mint-start-block start-block)
        (ok (var-set mint-end-block end-block))
    )
)

;; Set max supply
(define-public (set-max-supply (supply uint))
    (begin
        (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
        (asserts! (>= supply (var-get last-token-id)) (err u112))
        (ok (var-set max-supply supply))
    )
)

;; Set max per wallet
(define-public (set-max-per-wallet (max-amount uint))
    (begin
        (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
        (ok (var-set max-per-wallet max-amount))
    )
)

;; Set base URI (for reveal)
(define-public (set-base-uri (uri (string-utf8 200)))
    (begin
        (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
        (ok (var-set base-uri uri))
    )
)

;; Reveal collection
(define-public (reveal)
    (begin
        (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
        (asserts! (not (var-get is-revealed)) ERR-PACK-ALREADY-REVEALED)
        (ok (var-set is-revealed true))
    )
)

;; Set treasury address
(define-public (set-treasury (new-treasury principal))
    (begin
        (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
        (ok (var-set treasury new-treasury))
    )
)

;; Withdraw funds (emergency)
(define-public (withdraw-stx (amount uint) (recipient principal))
    (begin
        (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
        (stx-transfer? amount (as-contract tx-sender) recipient)
    )
)

;; Airdrop NFT (admin only)
(define-public (airdrop (recipient principal))
    (let
        (
            (new-token-id (+ (var-get last-token-id) u1))
        )
        (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
        (asserts! (<= new-token-id (var-get max-supply)) ERR-SOLD-OUT)
        
        (try! (nft-mint? stackspad-nft new-token-id recipient))
        (var-set last-token-id new-token-id)
        (map-set token-owners new-token-id recipient)
        
        (ok new-token-id)
    )
)

;; Batch airdrop
(define-public (batch-airdrop (recipients (list 50 principal)))
    (begin
        (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
        (ok (map airdrop-single recipients))
    )
)

(define-private (airdrop-single (recipient principal))
    (let
        (
            (new-token-id (+ (var-get last-token-id) u1))
        )
        (if (<= new-token-id (var-get max-supply))
            (begin
                (unwrap-panic (nft-mint? stackspad-nft new-token-id recipient))
                (var-set last-token-id new-token-id)
                (map-set token-owners new-token-id recipient)
                true
            )
            false
        )
    )
)
