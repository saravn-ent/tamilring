# 🎵 TamilRing

> Modern, ultra-fast Tamil ringtones, BGM discovery platform, and browser-based audio studio.

TamilRing is an end-to-end platform built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **Supabase (PostgreSQL)**. It delivers fast audio streaming, 1-tap dual downloads (`.mp3` for Android & `.m4r` for iPhone), browser-based Web Audio/AI editing tools, a community creator economy, and an automated SEO/AEO distribution engine.

---

## 🚀 Key Features

* **Instant Audio Streaming & Dock**: Persistent floating playback bar with range-request streaming, responsive waveforms via [Wavesurfer.js](https://wavesurfer.js.org/), and favorites management.
* **Dual Format Downloads**: 1-click downloads for Android (`.mp3`) and iOS (`.m4r`) complete with an on-screen iPhone ringtone setup guide.
* **Tamil Cinema Taxonomy**: Deeply cataloged by Movies, Maestros (Ilaiyaraaja, A.R. Rahman, Anirudh, Yuvan, Harris Jayaraj), Singers, Actors, Directors, Decades (80s to 2020s), and Devotional Deities.
* **In-Browser Audio Studio (`/tools`)**:
  * **MP3 Cutter**: Precision waveform trimming without uploading files to a server.
  * **AI Vocal Remover & Karaoke**: Client-side ONNX / WebAssembly model execution.
  * **Custom Name Ringtone Maker**: Mix Tamil prefixes and names with background cinema melodies.
  * **YouTube Importer**: Extract audio directly from video links for ringtone cutting.
* **Creator Gamification & UPI Payouts**: User levels (*Listener → Creator → Composer → Maestro → Legend*), point rewards for approved uploads, badge tiers, and atomic UPI withdrawal requests.
* **Enterprise Security & Anti-Censorship**: Upstash Redis rate limiting, SQL injection defense, and an aggressive bot barrier blocking automated copyright crawlers while whitelisting Googlebot and Lighthouse.
* **Instant Indexing Engine**: Automated IndexNow (Bing/Yandex) and Google Indexing API integration for instant URL discovery upon ringtone approval.

---

## 🛠️ Tech Stack

* **Framework**: Next.js 16 (App Router, Server Actions, React Server Components)
* **Library**: React 19, Lucide Icons, Canvas Confetti
* **Styling**: Tailwind CSS v4, Vanilla CSS animations
* **Database & Auth**: PostgreSQL on Supabase, Drizzle ORM
* **Audio & ML**: Wavesurfer.js, Web Audio API, `@xenova/transformers`, `onnxruntime-web`
* **External APIs**: TMDB (Posters & Cast), iTunes Search API, Google Indexing API, Bing IndexNow
* **Cache & Rate Limit**: Upstash Redis (Sliding window rate limiting)

---

## 📁 Project Structure

```
tamilring/
├── app/                        # Next.js 16 App Router
│   ├── actions/                # Server Actions (ZSA mutations)
│   ├── admin/                  # Admin Dashboard (moderation, withdrawals, DMCA)
│   ├── api/                    # Route Handlers (upload, download, cron, ai)
│   ├── artist/[artist_name]/   # Dynamic artist pages
│   ├── movie/[movie_slug]/     # Dynamic movie pages
│   ├── devotional/[deity]/     # Spiritual and devotional hub
│   ├── ringtone/[slug]/        # Ringtone detail & download page
│   ├── tools/                  # In-browser audio studio
│   ├── upload/                 # Audio upload wizard with auto-tagging
│   ├── layout.tsx              # Root Layout with audio dock & SEO schemas
│   └── page.tsx                # Universal homepage
│
├── components/                 # Modular React UI Components
│   ├── admin/                  # Admin shell, sidebar, and headers
│   ├── home/                   # Homepage sections (Maestros, Eras, Trending)
│   ├── ringtone/               # Ringtone modal and detail widgets
│   ├── ui/                     # Base design primitives
│   ├── AudioCutter.tsx         # Waveform audio editor
│   ├── FloatingAudioDock.tsx   # Persistent global audio player
│   └── NameRingtone.tsx        # Personalized caller tune generator
│
├── context/                    # Global React Contexts
│   ├── PlayerContext.tsx       # HTML5 Audio playback manager
│   ├── FavoritesContext.tsx    # Liked songs & local bookmarks
│   └── LanguageContext.tsx     # Language toggle and preferences
│
├── docs/                       # Architectural & Technical Documentation
│   ├── architecture/           # Core Web Vitals, AI research, web workers
│   ├── performance/            # LCP/TBT optimization plans & benchmarks
│   ├── security/               # WAF, anti-censorship, CSP, and RBAC
│   ├── legal/                  # Safe harbor, DMCA, and copyright plans
│   └── operations/             # Search indexing and backfill guides
│
├── lib/                        # Services, Repositories, Database & SEO
│   ├── db/                     # Drizzle schema and client
│   ├── seo/                    # Schema.org structured data generators
│   ├── tmdb.ts & itunes.ts     # Metadata enrichment clients
│   └── gamification.ts         # User points, tiers, and badges
│
├── scripts/                    # Maintenance, indexing & migration scripts
│   ├── backfill/               # Database backfill tasks
│   ├── diagnostics/            # Diagnostic checks and tests
│   ├── migrations/             # SQL migration helpers
│   ├── index-now.js            # Automated search engine submission
│   └── cron_poster_sync.js     # TMDB poster synchronization
│
└── archive/                    # Archived logs, backups, and audits (git-ignored)
```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the local Next.js development server at `http://localhost:3000` |
| `npm run build` | Compile the production Next.js application |
| `npm run start` | Start the production Next.js server |
| `npm run lint` | Run ESLint across the codebase |
| `npm run index:submit` | Submit recent ringtones to Bing IndexNow & Google Indexing |
| `npm run index:status` | Check indexing queue status |
| `npm run backup:csv` | Export ringtones database to CSV backup |

---

## 📚 Documentation

Detailed documentation is organized in the [`docs/`](./docs) directory:

- [Product Vision & Mission](./docs/PRODUCT_VISION.md)
- [Architecture & Core Web Vitals](./docs/architecture)
- [Performance & Optimization](./docs/performance)
- [Security & Anti-Bot Firewall](./docs/security)
- [Legal & Copyright Safe Harbor](./docs/legal)
- [Operations & Indexing](./docs/operations)

See the master index at [docs/README.md](./docs/README.md).
