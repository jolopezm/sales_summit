# Evolve Sales Summit beyond the local-first MVP

Sales Summit will keep its offline-first experience while adding optional advanced analytics, cloud backup, and multi-device access in deliberate stages.

## Next milestone: Advanced Analytics

1. Add an explicit opt-in action to Insights.
2. Send anonymized sales, commission settings, and work schedule to FastAPI over HTTPS.
3. Process each request without storing its payload.
4. Fall back to local insights when the service is unavailable.

The initial Python service should return:

- Closing projection with a confidence interval.
- Estimated probability of reaching the commission goal.
- Detection of unusual sales or days.
- Sample size, model name, and confidence level.
- An insufficient-data result instead of an unreliable prediction.

Names and device identifiers must not be included. The interface must explain what is sent before requesting consent.

## Future cloud backup

Cloud storage will be optional and require an account. The app must continue to work without registration.

| Topic | Decision |
| --- | --- |
| API | Versioned JSON contracts independent from Dexie records |
| Storage | PostgreSQL behind FastAPI |
| Identity | Optional authenticated account |
| Privacy | Encrypted transport, documented retention, explicit deletion |
| Offline use | IndexedDB keeps locally available records |
| Synchronization | UUID-based entities with timestamps and explicit conflict rules |
| Clients | The same API supports the mobile PWA and a future desktop web app |

Remote backup alone does not reduce local storage. A later archive feature may remove older local records only after confirming a valid remote copy and warning that archived data requires connectivity.

## Delivery checklist

- [ ] Define and version the public backup schema.
- [ ] Add FastAPI contract and service tests.
- [ ] Add consent, retry, timeout, and offline states.
- [ ] Define authentication and account deletion.
- [ ] Encrypt sensitive data in transit and at rest.
- [ ] Define synchronization conflicts before enabling multiple clients.
- [ ] Test restoration before presenting cloud storage as a backup.
