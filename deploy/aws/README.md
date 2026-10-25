# Deploy Un-Said on AWS

One small server runs the backend behind **Caddy**, which gets a real HTTPS certificate by itself for a free `<your-ip>.sslip.io` name. About 15 minutes, about **$0.50 for the hackathon weekend**.

Why it has to be like this:
- **HTTPS is required.** Mom's "Hold to reply" uses the browser microphone, which only works on `https://` pages. iPhones also prefer `https://` for the app.
- **WebSockets are required.** The live transcript in Talk streams over `wss://…/api/rants/live`. Caddy passes WebSocket upgrades through with no extra configuration.
- **The disk has to persist.** SQLite, the photos and Mom's voice notes live in `/srv/unsaid/data` on the server and survive restarts and updates.

| | |
|---|---|
| **Primary** | **Lightsail instance**: Ubuntu 24.04, 1 GB, $7/mo · Docker Compose · Caddy · `<ip>.sslip.io` |
| **Fallback** | **EC2 instance** with the same scripts (if Lightsail isn't available on the account) |
| **Not AWS** | `render.yaml` at the repo root (Render; needs a paid plan + disk for persistence) |

### Why not the managed options

| Option | Verdict |
|---|---|
| **App Runner** | ❌ Closed: "AWS App Runner is no longer open to new customers" ([AWS](https://docs.aws.amazon.com/apprunner/latest/dg/what-is-apprunner.html)). It also historically lacked WebSockets ([AWS re:Post](https://repost.aws/questions/QU0jOAcOoTQqigUj6B9oGDxg/websockets-on-apprunner)). |
| **Lightsail container services** | ❌ The public endpoint is HTTPS-only, and the docs describe no persistent disk for containers ([AWS](https://docs.aws.amazon.com/lightsail/latest/userguide/amazon-lightsail-container-services.html)), so the database and voice notes would vanish on every redeploy. |
| **ECS Fargate + ALB / ECS Express Mode** | ⚠️ Works: ALBs "provide native support for WebSockets" ([AWS](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-listeners.html)), and Express Mode sets up an ALB with TLS and a URL for you ([AWS](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/express-service-overview.html)). But it needs an image registry push (no Docker on the laptop), EFS for the disk (SQLite over NFS is fragile), and roughly $20+/mo. Too many moving parts for a 2-day hackathon. |
| **One instance + Caddy** | ✅ One machine, one disk, real HTTPS via Let's Encrypt (ZeroSSL fallback) as long as ports 80/443 are open and the name points at the server ([Caddy](https://caddyserver.com/docs/automatic-https)). |

---

## Before you start

- An AWS account.
- **While the GitHub repo is private:** a read-only token. On GitHub: Settings → Developer settings → Fine-grained tokens → Generate. Under *Repository access*, pick only `MuditUpadhyay04/HackTX`; under *Permissions*, set *Contents* to **Read-only**. If the repo goes public for Devpost, skip the token everywhere below.
- **Keys never go in a launch script or user data.** AWS says user data "is not protected by authentication or cryptographic methods". Keys go in `/srv/unsaid/.env` on the server, over SSH.

## Path A: Lightsail (recommended)

**1. Create the instance.** Go to [lightsail.aws.amazon.com](https://lightsail.aws.amazon.com) → **Create instance**:
- Region: **Ohio (us-east-2)** or N. Virginia (us-east-1), both close to Austin.
- Platform: **Linux/Unix** → **OS Only** → **Ubuntu 24.04 LTS**.
- Plan: **$7 USD (1 GB RAM, 2 vCPUs, 40 GB SSD)**. The 0.5 GB plan can work but builds slowly.
- Name: `unsaid` → **Create instance**.
- Leave **Launch script** empty.

**2. Open HTTPS.** Instance → **Networking** → *IPv4 Firewall* → **Add rule** → Application **HTTPS** (TCP 443) → **Create**. New Ubuntu instances only open 22 and 80 ([AWS](https://docs.aws.amazon.com/lightsail/latest/userguide/understanding-firewall-and-port-mappings-in-amazon-lightsail.html)). Without 443 there's no certificate.

**3. Pin the IP.** **Networking** (left menu) → **Create static IP** → attach it to `unsaid` → **Create**. It's free while attached, and without it the IP changes on every stop/start ([AWS](https://docs.aws.amazon.com/lightsail/latest/userguide/understanding-static-ip-addresses-in-amazon-lightsail.html)).

**4. Run the bootstrap.** Instance → **Connect using SSH** (a terminal opens in the browser). Paste:

```bash
export GIT_TOKEN=github_pat_...   # the read-only token (omit if the repo is public)
curl -fsSL -H "Authorization: Bearer $GIT_TOKEN" -H "Accept: application/vnd.github.raw+json" \
  "https://api.github.com/repos/MuditUpadhyay04/HackTX/contents/deploy/aws/bootstrap.sh?ref=main" -o bootstrap.sh
sudo GIT_TOKEN="$GIT_TOKEN" bash bootstrap.sh
```

If the repo is public: `curl -fsSL https://raw.githubusercontent.com/MuditUpadhyay04/HackTX/main/deploy/aws/bootstrap.sh -o bootstrap.sh && sudo bash bootstrap.sh`

In 3–5 minutes it installs Docker, clones the repo to `/srv/unsaid/HackTX`, creates `/srv/unsaid/.env` (with a generated `APP_KEY`, plus `DOMAIN` and `PUBLIC_BASE_URL` from the static IP), builds, starts, waits for HTTPS, and prints:

```
App + demo panel   https://3-91-12-34.sslip.io/app/?key=<APP_KEY>&demo=1
mobile/.env.local:  EXPO_PUBLIC_API_URL=https://3-91-12-34.sslip.io
                    EXPO_PUBLIC_APP_KEY=<APP_KEY>
```

It runs in mock-AI mode until you add the keys.

**5. Add the keys.**

```bash
sudo nano /srv/unsaid/.env      # MODEL_API_KEY, WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, ...
                                # save: Ctrl+O, Enter, Ctrl+X
sudo /srv/unsaid/HackTX/deploy/aws/update.sh --no-pull
```

The `SEED_*` phone numbers are only read when the database is empty. On a fresh server with nothing to keep, you can re-seed with `sudo rm -rf /srv/unsaid/data/*` and then `update.sh --no-pull`. Otherwise set them in the demo panel → **people**.

**6. Check the keys** (one small real request each; secrets are never printed):

```bash
sudo docker compose --env-file /srv/unsaid/.env -f /srv/unsaid/HackTX/deploy/aws/docker-compose.yml \
  exec backend python scripts/check_keys.py
```

**7. Point the app at it.** On the laptop, in `mobile/.env.local`:

```
EXPO_PUBLIC_API_URL=https://3-91-12-34.sslip.io
EXPO_PUBLIC_APP_KEY=<APP_KEY from step 4>
```

Then restart Metro with `npx expo start --lan --clear`, because `EXPO_PUBLIC_*` values are baked in when the bundle builds. The phone no longer needs to be on the laptop's network to reach the backend.

### The same thing from the AWS CLI

```bash
# Find the current IDs (they change between plan generations):
aws lightsail get-blueprints --query "blueprints[?contains(blueprintId,'ubuntu_24')].blueprintId"
aws lightsail get-bundles --query "bundles[?price==\`7.0\`].[bundleId,ramSizeInGb]"

aws lightsail create-instances --instance-names unsaid --availability-zone us-east-2a \
  --blueprint-id <ubuntu_24_04 blueprint> --bundle-id <the $7 bundle>
aws lightsail open-instance-public-ports --instance-name unsaid \
  --port-info fromPort=443,toPort=443,protocol=TCP
aws lightsail allocate-static-ip --static-ip-name unsaid-ip
aws lightsail attach-static-ip --static-ip-name unsaid-ip --instance-name unsaid
aws lightsail get-static-ip --static-ip-name unsaid-ip --query staticIp.ipAddress
# Then step 4 over SSH (browser SSH, or the default key: aws lightsail download-default-key-pair).
```

## Path B: EC2 (fallback)

EC2 console → **Launch instance**:
- AMI: **Ubuntu Server 24.04 LTS** (Amazon Linux 2023 also works with the same script).
- Type: **t3.small** (2 GB).
- Key pair: create one and download the `.pem` file.
- **Security group:** SSH 22 from *My IP*, plus **HTTP 80** and **HTTPS 443** from *Anywhere*.
- Storage: 20 GB gp3 → **Launch**.

Optionally, allocate an **Elastic IP** and associate it. Then:

```powershell
ssh -i unsaid.pem ubuntu@<public-ip>
```

…and run the commands from step 4 (then steps 5–7). If you associate an Elastic IP later, re-run `sudo bash bootstrap.sh`. It notices the new IP and moves `DOMAIN` and `PUBLIC_BASE_URL` with it.

**Secrets via SSM (EC2 only, optional):** an EC2 instance with an IAM role can pull keys from Parameter Store, for example `aws ssm get-parameter --name /unsaid/MODEL_API_KEY --with-decryption --query Parameter.Value --output text`, then write them into `/srv/unsaid/.env`. Lightsail instances can't take an IAM role, so on Lightsail use the `.env` file over SSH. For a 2-day hackathon, the `.env` file (chmod 600, outside git) is enough.

## Your own domain instead of sslip.io

Point an **A record** (for example `api.unsaid.app`) at the static IP. Then:

```bash
sudo DOMAIN=api.unsaid.app GIT_TOKEN="$GIT_TOKEN" bash bootstrap.sh
```

A custom `DOMAIN` is kept on later runs. Update `EXPO_PUBLIC_API_URL` to match.

## Day of the demo

| Task | Command (on the server) |
|---|---|
| Deploy the latest `main` | `sudo GIT_TOKEN=… /srv/unsaid/HackTX/deploy/aws/update.sh` |
| Apply an edited `.env` | `sudo /srv/unsaid/HackTX/deploy/aws/update.sh --no-pull` |
| Watch the logs | `sudo docker compose --env-file /srv/unsaid/.env -f /srv/unsaid/HackTX/deploy/aws/docker-compose.yml logs -f --tail 100 backend` |
| Back up the data | `sudo tar czf ~/unsaid-data-$(date +%F-%H%M).tgz -C /srv/unsaid data` |
| Snapshot everything | Lightsail → instance → **Snapshots** → **Create snapshot** (do this before judging) |

**Bring the laptop's demo data along** (the renamed cast, the kitchen photo, Mom's voice note). Lightsail's default key comes from Account → SSH keys. From the laptop:

```powershell
scp -i lightsail.pem -r backend/data ubuntu@<ip>:/tmp/unsaid-data
```

Then on the server:

```bash
sudo docker compose --env-file /srv/unsaid/.env -f /srv/unsaid/HackTX/deploy/aws/docker-compose.yml stop backend
sudo cp -r /tmp/unsaid-data/. /srv/unsaid/data/
sudo /srv/unsaid/HackTX/deploy/aws/update.sh --no-pull
```

Card links already sent from the laptop won't work, because they point at the laptop. Send Mom a fresh link from the demo panel.

Don't stop the instance during the event. Restarting is fine.

## Cost

| | Weekend | Month |
|---|---|---|
| Lightsail $7 plan (1 GB, 2 TB transfer included) | ~$0.50 | $7 |
| Static IP | free while attached ([AWS](https://docs.aws.amazon.com/lightsail/latest/userguide/understanding-static-ip-addresses-in-amazon-lightsail.html)) | free while attached |
| Snapshot (~2 GB at $0.05/GB-mo) | ~$0.01 | ~$0.10 |
| *EC2 fallback:* t3.small + public IPv4 ($0.005/h, [AWS](https://aws.amazon.com/vpc/pricing/)) + 20 GB gp3 | ~$1.50 | ~$20 |

New accounts may get free usage through the AWS Free Tier. Check the console when you sign up.

## Teardown

- **Lightsail:** delete the instance, then **delete the static IP** (it's billed once it's detached), then delete the snapshots.
- **EC2:** terminate the instance, **release the Elastic IP**, then delete any snapshots and volumes.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `https://…sslip.io` never answers | Port **443** isn't open (step 2). Then: `nslookup <name>` should return the static IP. Then the Caddy logs: `… logs --tail 80 caddy`. |
| A certificate error in the logs | Caddy retries and falls back from Let's Encrypt to ZeroSSL by itself. Keep the `caddy_data` volume: deleting it means new certificates and possible rate limits. Your own domain avoids the shared sslip.io name. |
| The live transcript never starts | Run `check_keys.py`. A rejected key fails at the realtime handshake. Caddy passes WebSockets through as-is. |
| Mom's "Hold to reply" does nothing | The page must be `https://`. On the phone, allow the microphone for the site. |
| A WhatsApp link points at localhost | `PUBLIC_BASE_URL` in `.env` must be `https://<DOMAIN>`, then `update.sh --no-pull`. |
| The build runs out of memory | The bootstrap adds 1 GB of swap. Or pick the 2 GB plan. |

## Files here

| File | What it is |
|---|---|
| `bootstrap.sh` | First install and re-runs: Docker, code, `.env`, build, start, HTTPS check |
| `update.sh` | Pull + rebuild + restart the backend (`--no-pull` to apply `.env` only) |
| `docker-compose.yml` | The backend (data on `/srv/unsaid/data`) behind Caddy on 80/443 |
| `Caddyfile` | Automatic HTTPS for `{$DOMAIN}`; WebSockets pass through |
| `env.template` | Every setting the backend reads. Copied once to `/srv/unsaid/.env`. |

## Sources

- App Runner availability: https://docs.aws.amazon.com/apprunner/latest/dg/what-is-apprunner.html
- App Runner and WebSockets (AWS re:Post): https://repost.aws/questions/QU0jOAcOoTQqigUj6B9oGDxg/websockets-on-apprunner
- Lightsail container services: https://docs.aws.amazon.com/lightsail/latest/userguide/amazon-lightsail-container-services.html
- ALB WebSockets: https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-listeners.html
- ECS Express Mode: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/express-service-overview.html
- Lightsail firewall defaults: https://docs.aws.amazon.com/lightsail/latest/userguide/understanding-firewall-and-port-mappings-in-amazon-lightsail.html
- Lightsail static IPs: https://docs.aws.amazon.com/lightsail/latest/userguide/understanding-static-ip-addresses-in-amazon-lightsail.html
- Lightsail launch scripts (run as root): https://docs.aws.amazon.com/lightsail/latest/userguide/lightsail-how-to-configure-server-additional-data-shell-script.html
- Lightsail user data isn't protected: https://docs.aws.amazon.com/lightsail/latest/userguide/amazon-lightsail-instance-metadata.html
- Lightsail pricing: https://aws.amazon.com/lightsail/pricing/
- Public IPv4 pricing: https://aws.amazon.com/vpc/pricing/
- Caddy automatic HTTPS: https://caddyserver.com/docs/automatic-https
- Caddy reverse_proxy (WebSockets, stream_close_delay): https://caddyserver.com/docs/caddyfile/directives/reverse_proxy
- sslip.io / nip.io: https://nip.io/
- Let's Encrypt rate limits: https://letsencrypt.org/docs/rate-limits/
- Docker on Ubuntu: https://docs.docker.com/engine/install/ubuntu/
