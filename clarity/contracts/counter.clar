(define-data-var counter uint u0)
(define-constant err-underflow (err u1))

(define-read-only (get-count)
  (ok (var-get counter)))

(define-public (increment)
  (begin
    (var-set counter (+ (var-get counter) u1))
    (ok (var-get counter))))

(define-public (decrement)
  (begin
    (asserts! (> (var-get counter) u0) err-underflow)
    (var-set counter (- (var-get counter) u1))
    (ok (var-get counter))))
