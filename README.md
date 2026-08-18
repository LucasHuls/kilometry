# Kilometry

[![License: MIT with Commons Clause](https://img.shields.io/badge/license-MIT%20with%20Commons%20Clause-blue.svg)](LICENSE)

Self-hosted webapp for tracking mileage reimbursement. For freelancers and employees who want to log their trips and reimbursement without hassle.

![Kilometry screenshot](docs/screenshot.png)

## Quickstart

```bash
git clone https://github.com/lucashuls/kilometry.git
cd kilometry
cp .env.example .env
# fill in SESSION_SECRET, MYSQL_* and ADMIN_* in .env
docker compose up -d
```

The app then runs on `http://localhost:3000` (or the port from `PORT`). Log in with the `ADMIN_USERNAME`/`ADMIN_PASSWORD` from your `.env`, there's no self-registration, this is the only account. Want to change the password? Update `ADMIN_PASSWORD` and restart the container.

Want the weekly stats and submission reminder emails (settings)? Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` (a [Resend](https://resend.com) account with a verified sending domain) in your `.env`. Both emails are opt-in per feature and off by default. Which day they send on is evaluated against the container's local time, so also set `TZ` (e.g. `TZ=Europe/Amsterdam`) if you don't want UTC.

`docker compose up -d` pulls the published image from `ghcr.io/lucashuls/kilometry`, built and released automatically on every push to `main`. Want to pin a specific version instead of always getting the latest one? Set `VERSION=v1.2.3` in your `.env`. Building from source instead (for development, or if you've made local changes) still works: `docker compose up -d --build`.

## Data model

Every trip has a date, location, and number of km. You manage your own locations (name + an optional fixed distance that's auto-filled when you pick that location, but stays overridable).

The reimbursement per trip is `km * kmRate`, where `kmRate` is configurable (settings).

## Features

- Add, edit, and delete trips
- Manage locations with a configurable fixed distance per location
- Overview with a monthly filter, monthly and all-time totals, and a chart per month
- XLSX export of the filtered trips, with configurable columns (settings)
- Optional weekly stats and submission reminder emails via Resend (settings)
- Bilingual (NL/EN)
- Installable as a PWA

## Contributing

Kilometry is intentionally kept minimal in scope. See [CONTRIBUTING.md](CONTRIBUTING.md) before proposing a large feature.

## License

MIT with the Commons Clause, see [LICENSE](LICENSE). In short: free to use, self-host, modify, and contribute to, just not to sell or offer as a paid product or service.

---

Made with ❤️ by [Lucas Huls](https://github.com/lucashuls).
