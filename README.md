# MiLyfe

**Add Value. Raise Quality of Life.**

The United States Constitution turned into a living lifestyle platform. A system that still works after anyone leaves. People govern themselves as a collective — as the Constitution intended.

**Live:** [milyfe.fun](https://milyfe.fun) | **Discord:** [discord.gg/b4hkHUqU6N](https://discord.gg/b4hkHUqU6N)

---

## What is MiLyfe?

MiLyfe is civic infrastructure — not a social network, not a campaign app. It's a full-stack platform that gives communities the tools to self-govern, build shared wealth, and support each other without intermediaries.

Built with $0 over 11 years. No venture capital. No founder keys. No permanent hold on power. The code is public. The votes are public. If it isn't here, it isn't the proof.

## What It Does

| Feature | Description |
|---------|-------------|
| **$MLY Economy** | Weekly credits (UBI) for every citizen. Spend, save, or give back. Real circulation. |
| **Direct Democracy** | Propose, vote, sunset. Public voting record. Quorum requirements. No backroom deals. |
| **Standing** | 8 facets of reputation earned through action — not popularity, not money. |
| **Connect** | Real-time messaging with real neighbors. Not followers — connections. |
| **Learn** | 35 modules. Free education that works offline. From rights to reentry to food safety. |
| **Street** | Marketplace, community quests with $MLY rewards, surplus/free items, map view. |
| **Mi** | AI assistant. Send $MLY, find resources, explain governance — through conversation. |
| **Safety** | Leave-Now with session revocation. Encrypted journal. Walk-home timers. |
| **Treasury** | Full transparency. Every dollar in and out. Public ledger. |
| **Transparency** | Every algorithm explained with exact parameters. No hidden systems. |

## Tech

- **Framework:** Next.js 15 (App Router)
- **Database:** Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Styling:** Tailwind CSS + custom design tokens
- **Security:** Rate limiting, Zod validation, CSRF, RLS, DOMPurify, audit trail
- **Hosting:** Vercel
- **AI:** Groq (Llama 3.1) with function calling
- **PWA:** Service worker, offline support, IndexedDB

## Run It Yourself

```bash
git clone https://github.com/RealMiLyfe/MiLyfe-Platform-OS.git
cd MiLyfe-Platform-OS
npm install
cp .env.local.example .env.local
# Fill in your Supabase credentials
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server only) |
| `CRON_SECRET` | Yes | Cron job authentication |
| `GROQ_API_KEY` | For Mi | Groq API key (free tier at groq.com) |
| `UPSTASH_REDIS_REST_URL` | Optional | Rate limiting (Upstash Redis) |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | Rate limiting token |

## The Numbers

- **$0** invested in 11 years of building
- **100%** power with the people
- **50+ routes** live in production
- **35 learning modules** — free, offline-capable
- **$10M $MLY** seed treasury for citizens

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). PRs welcome. Branch protection is on — all changes require review.

## Security

Report vulnerabilities to **contact@milyfe.fun**. See [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE).

---

*Open source. People-owned. A system that still works after anyone leaves.*
