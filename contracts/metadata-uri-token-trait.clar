(define-trait metadata-uri-token-trait
  (
    ;; Gets a URI string that will point to additional metadata about
    ;; the token.
    ;; This can be used for metadata, extra detailed information, investor docs, etc
    (token-uri () (response (string-utf8 1024) uint))
  )
)