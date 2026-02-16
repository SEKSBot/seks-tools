# @seksbot/seks-tools

CLI tools for making authenticated requests through the SEKS broker. Secrets never touch the shell — they're resolved at runtime from the broker.

## Install

```bash
npm install -g @seksbot/seks-tools
```

## Configuration

Config is resolved in order:

1. **Env vars:** `SEKS_BROKER_URL` + `SEKS_BROKER_TOKEN`
2. **`~/.openclaw/openclaw.json`** → `seks.broker.primary` / `seks.broker.secondary`
3. **`~/.openclaw/openclaw.json`** → `seks.broker.url` / `seks.broker.token` (legacy)

## Tools

### `seks-http` — HTTP client with credential injection

```bash
# GET with bearer token from broker
seks-http get https://api.github.com/user --auth-bearer github/pat

# POST with data
seks-http post https://api.example.com/data \
  --auth-bearer myservice/api_key \
  --data '{"key": "value"}' \
  --header 'Content-Type: application/json'

# Basic auth
seks-http get https://api.example.com/secure \
  --auth-basic-user myservice/username \
  --auth-basic-pass myservice/password

# Header with secret value
seks-http get https://api.example.com/data \
  --header-secret 'X-API-Key:myservice/api_key'

# Capability-based (broker resolves credentials)
seks-http get https://api.github.com/repos \
  --capability github/read
```

Response body goes to stdout, status/headers to stderr.

### `seks-git` — git wrapper with credential injection

```bash
# Clone with token injection
seks-git clone https://github.com/org/repo.git --auth-token github/pat

# Push with token
seks-git push --auth-token github/pat

# Pull with passthrough args
seks-git pull origin main --auth-token github/pat
```

Tokens are injected as `x-access-token` in HTTPS URLs (GitHub PAT style).

### `listseks` — list available secrets/capabilities

```bash
# List everything
listseks

# List capabilities
listseks --capabilities

# Filter by provider
listseks --provider github

# JSON output
listseks --json
listseks --capabilities --json
```

## Development

```bash
pnpm install
pnpm build
pnpm test
```
