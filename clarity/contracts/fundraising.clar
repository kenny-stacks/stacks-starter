;; Fundraising Campaign Contract
;; A simple contract to accept crypto donations in STX or sBTC.

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-not-authorized (err u100))
(define-constant err-campaign-ended (err u101))
(define-constant err-not-initialized (err u102))
(define-constant err-not-cancelled (err u103))
(define-constant err-campaign-not-ended (err u104))
(define-constant err-campaign-cancelled (err u105))
(define-constant err-already-initialized (err u106))
(define-constant err-already-withdrawn (err u107))

(define-constant default-duration u4320) ;; Duration in *Bitcoin* blocks. This default value means is if a block is 10 minutes, this is roughly 30 days.

;; Data vars
(define-data-var is-campaign-initialized bool false)
(define-data-var is-campaign-cancelled bool false)
(define-data-var beneficiary principal contract-owner)
(define-data-var campaign-duration uint u173000)
(define-data-var campaign-start uint u0)
(define-data-var campaign-goal uint u0)
(define-data-var total-stx uint u0) ;; in microstacks
(define-data-var total-sbtc uint u0) ;; in sats
(define-data-var donation-count uint u0)
(define-data-var is-campaign-withdrawn bool false)

;; Maps
(define-map stx-donations
  principal
  uint
) ;; donor -> amount
(define-map sbtc-donations
  principal
  uint
) ;; donor -> amount

;; Initialize the campaign (goal in US dollars)
;; Pass duration as 0 to use the default duration (~30 days)
;; Can only be called once
(define-public (initialize-campaign
    (goal uint)
    (duration uint)
  )
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-not-authorized)
    (asserts! (not (var-get is-campaign-initialized)) err-already-initialized)
    (var-set is-campaign-initialized true)
    (var-set campaign-start burn-block-height)
    (var-set campaign-goal goal)
    (var-set campaign-duration duration)
    (var-set campaign-duration
      (if (is-eq duration u0)
        default-duration
        duration
      ))
    (ok true)
  )
)

;; Cancel the campaign
;; Only the owner can call this, at any time during or after the campaign
;; Allows donors to get a refund
;; Can only be called once
(define-public (cancel-campaign)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-not-authorized)
    (asserts! (var-get is-campaign-initialized) err-not-initialized)
    (asserts! (not (var-get is-campaign-withdrawn)) err-already-withdrawn)
    (var-set is-campaign-cancelled true)
    (ok true)
  )
)

;; Donate STX. Pass amount in microstacks.
(define-public (donate-stx (amount uint))
  (begin
    (asserts! (var-get is-campaign-initialized) err-not-initialized)
    (asserts! (not (var-get is-campaign-cancelled)) err-campaign-cancelled)
    (asserts!
      (< burn-block-height
        (+ (var-get campaign-start) (var-get campaign-duration))
      )
      err-campaign-ended
    )
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (map-set stx-donations tx-sender
      (+ (default-to u0 (map-get? stx-donations tx-sender)) amount)
    )
    (var-set total-stx (+ (var-get total-stx) amount))
    (var-set donation-count (+ (var-get donation-count) u1))
    (ok true)
  )
)

;; Donate sBTC. Pass amount in Satoshis.
(define-public (donate-sbtc (amount uint))
  (begin
    (asserts! (var-get is-campaign-initialized) err-not-initialized)
    (asserts! (not (var-get is-campaign-cancelled)) err-campaign-cancelled)
    (asserts!
      (< burn-block-height
        (+ (var-get campaign-start) (var-get campaign-duration))
      )
      err-campaign-ended
    )
    (try! (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
      transfer amount contract-caller (as-contract tx-sender) none
    ))
    (map-set sbtc-donations tx-sender
      (+ (default-to u0 (map-get? sbtc-donations tx-sender)) amount)
    )
    (var-set total-sbtc (+ (var-get total-sbtc) amount))
    (var-set donation-count (+ (var-get donation-count) u1))
    (ok true)
  )
)

;; Withdraw funds (only beneficiary, only if campaign is ended)
(define-public (withdraw)
  (let (
      (total-stx-amount (var-get total-stx))
      (total-sbtc-amount (var-get total-sbtc))
    )
    (asserts! (var-get is-campaign-initialized) err-not-initialized)
    (asserts! (not (var-get is-campaign-cancelled)) err-campaign-cancelled)
    (asserts! (not (var-get is-campaign-withdrawn)) err-already-withdrawn)
    (asserts! (is-eq tx-sender (var-get beneficiary)) err-not-authorized)
    (asserts!
      (>= burn-block-height
        (+ (var-get campaign-start) (var-get campaign-duration))
      )
      err-campaign-not-ended
    )
    (as-contract (begin
      (if (> total-stx-amount u0)
        (try! (stx-transfer? total-stx-amount (as-contract tx-sender)
          (var-get beneficiary)
        ))
        true
      )
      (if (> total-sbtc-amount u0)
        (try! (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
          transfer total-sbtc-amount (as-contract tx-sender)
          (var-get beneficiary) none
        ))
        true
      )
      (var-set is-campaign-withdrawn true)
      (ok true)
    ))
  )
)

;; Refund to donor
;; Campaign owner can choose to allow this by cancelling the campaign
(define-public (refund)
  (let (
      (stx-amount (default-to u0 (map-get? stx-donations tx-sender)))
      (sbtc-amount (default-to u0 (map-get? sbtc-donations tx-sender)))
      (contributor tx-sender)
    )
    (asserts! (var-get is-campaign-cancelled) err-not-cancelled)
    (if (> stx-amount u0)
      (begin
        (as-contract (try! (stx-transfer? stx-amount tx-sender contributor)))
      )
      true
    )
    (map-delete stx-donations tx-sender)
    (if (> sbtc-amount u0)
      (begin
        (as-contract (try! (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
          transfer sbtc-amount tx-sender contributor none
        )))
      )
      true
    )
    (map-delete sbtc-donations tx-sender)
    (ok true)
  )
)

;; Getter functions
(define-read-only (get-stx-donation (donor principal))
  (ok (default-to u0 (map-get? stx-donations donor)))
)

(define-read-only (get-sbtc-donation (donor principal))
  (ok (default-to u0 (map-get? sbtc-donations donor)))
)

(define-read-only (get-campaign-info)
  (ok {
    start: (var-get campaign-start),
    end: (+ (var-get campaign-start) (var-get campaign-duration)),
    goal: (var-get campaign-goal),
    totalStx: (var-get total-stx),
    totalSbtc: (var-get total-sbtc),
    donationCount: (var-get donation-count),
    isExpired: (>= burn-block-height
      (+ (var-get campaign-start) (var-get campaign-duration))
    ),
    isWithdrawn: (var-get is-campaign-withdrawn),
    isCancelled: (var-get is-campaign-cancelled),
  })
)

(define-read-only (get-contract-balance)
  (stx-get-balance (as-contract tx-sender))
)
