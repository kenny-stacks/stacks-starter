;; counter.tests.clar - Rendezvous fuzz tests
;;
;; NOTE: Rendezvous merges test files with the target contract.
;; Tests call contract functions directly (not via contract-call?).

;; ============================================
;; INVARIANT TESTS (checked after every call)
;; ============================================

;; Counter value is always consistent with increment/decrement history
;; If increments > decrements, counter must be positive
(define-read-only (invariant-counter-consistent)
  (let (
    (inc-calls (default-to u0 (get called (map-get? context "increment"))))
    (dec-calls (default-to u0 (get called (map-get? context "decrement"))))
  )
    (if (> inc-calls dec-calls)
      (> (var-get counter) u0)
      true)))

;; Counter equals the difference between successful increments and decrements
(define-read-only (invariant-counter-equals-diff)
  (let (
    (inc-calls (default-to u0 (get called (map-get? context "increment"))))
    (dec-calls (default-to u0 (get called (map-get? context "decrement"))))
  )
    (is-eq (var-get counter) (- inc-calls dec-calls))))

;; ============================================
;; PROPERTY TESTS
;; ============================================

;; Increment always succeeds and increases counter by 1
(define-public (test-increment-succeeds)
  (let (
    (before (var-get counter))
    (result (unwrap-panic (increment)))
  )
    (if (is-eq result (+ before u1))
      (ok true)
      (err u100))))

;; Decrement succeeds when counter > 0, returning counter - 1
(define-public (test-decrement-when-positive)
  (let ((before (var-get counter)))
    (if (> before u0)
      (let ((result (unwrap-panic (decrement))))
        (if (is-eq result (- before u1))
          (ok true)
          (err u200)))
      ;; Skip test when counter is 0 (precondition not met)
      (ok true))))

;; Decrement fails with err u1 when counter is 0
(define-public (test-decrement-underflow-guard)
  (let ((before (var-get counter)))
    (if (is-eq before u0)
      ;; Counter is 0, decrement should fail
      (let ((result (decrement)))
        (if (is-err result)
          (if (is-eq (unwrap-err-panic result) u1)
            (ok true)
            (err u203))
          (err u202)))
      ;; Skip test when counter > 0 (precondition not met)
      (ok true))))

;; Increment then decrement returns to original value
(define-public (test-increment-decrement-roundtrip)
  (let ((before (var-get counter)))
    (unwrap-panic (increment))
    (unwrap-panic (decrement))
    (let ((after (var-get counter)))
      (if (is-eq before after)
        (ok true)
        (err u300)))))

;; get-count returns current counter value
(define-public (test-get-count-matches-state)
  (let (
    (direct (var-get counter))
    (via-fn (unwrap-panic (get-count)))
  )
    (if (is-eq direct via-fn)
      (ok true)
      (err u400))))
