# V0.3.0 — Customer Authentication & Dashboard

## Added
- Passwordless email-link customer login
- Phone OTP customer login
- Firebase Auth state protection
- UID-based customer lookup
- UID-scoped subscription query
- Subscription status and expiry display
- Days-remaining calculation
- Expiring-soon indicator
- Secure sign-out
- Dedicated login CSS
- Dedicated dashboard CSS

## Security direction
The dashboard does not trust a phone number or email address as authorization. It requires an authenticated Firebase user and queries subscriptions by `customerUid`.

## Next integration
Update signup so the authenticated Firebase UID is linked to the customer record before orders/subscriptions are created.
