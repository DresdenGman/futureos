# Security policy

## Supported version

Security fixes target the version currently deployed at [futureos.space](https://futureos.space).

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability involving authentication, authorization, data exposure, rate limiting, or deployment configuration. Instead, use GitHub's private vulnerability reporting feature for this repository when available, or contact the repository owner through the private contact method listed on their GitHub profile.

Include the affected route, reproduction steps, impact, and any suggested mitigation. Do not access or modify another person's records while testing.

## Security boundaries

- Authentication identity is supplied by the hosting platform.
- Database reads and writes must be scoped by the authenticated user identifier.
- Client-supplied ownership fields are not trusted.
- Secrets and deployment credentials must never be committed.
- Changes that add analytics or personal-data collection require a privacy review.

This project is not medical, legal, investment, or crisis-response software.
