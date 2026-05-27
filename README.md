# OSRS Group Ironman Tracker

A GitHub Pages site that tracks daily progress for a Group Ironman team. Shows XP gains, boss kills, level-ups, clue completions, and recent loot drops.

**Live site:** https://faich.github.io/osrs_tracker/

---

## How it works

- On page load the site fetches player snapshots from [Wise Old Man](https://wiseoldman.net) and computes daily deltas rendered as collapsible diary entries, most recent first.
- The **Update** button on the home page triggers WOM to pull a fresh snapshot from the OSRS hiscores for each group member.
- A [Dink](https://github.com/pajlads/DinkPlugin) RuneLite plugin posts loot drop events to a **Cloudflare Worker** through a Discord Webhook, which stores and serves them. The tracker fetches drops from the Worker and displays them in the Recent Drops panel.
- Drop filtering (by value threshold, item allowlist, etc.) is configured in the Dink plugin settings on each player's RuneLite client.

## GitHub Actions

| Workflow | Trigger | Purpose |
|---|---|---|
| `deploy.yml` | Push to `main` | Builds and deploys to GitHub Pages |
| `update-wom.yml` | Daily 23:30 UTC / manual | Updates each player's WOM snapshot |

## Local development

```bash
npm install
npm run dev
```

## Stack

- React 19 + TypeScript + Vite
- [Wise Old Man API](https://wiseoldman.net) — XP, boss kills, level-ups
- Cloudflare Worker — receives and stores loot drop events from Dink
- Dink RuneLite plugin — posts in-game drop notifications to the Worker
- GitHub Pages + GitHub Actions
