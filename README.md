# OSRS Group Ironman Diary

A GitHub Pages site that tracks daily progress for a Group Ironman team using the [Wise Old Man](https://wiseoldman.net) API. Each day's XP gains, boss kills, level-ups, and clue completions are displayed as diary entries.

**Live site:** https://faich.github.io/osrs_tracker/

**Group members:** Flatlus Fred · Gonore Geir · Skabb Svein · Kreft Kari

---

## How it works

- A scheduled GitHub Action runs every night at **23:30 UTC**, calling the WOM update endpoint for each player to capture a daily snapshot.
- On page load the site fetches the last 30 days of snapshots per player directly from the WOM API (no backend needed).
- Daily deltas are computed from consecutive snapshots and rendered as collapsible diary entries, most recent first.
- Clicking a player's name in the header filters the diary to show only their entries.

## GitHub Actions

| Workflow | Trigger | Purpose |
|---|---|---|
| `deploy.yml` | Push to `main` | Builds and deploys to GitHub Pages |
| `update-wom.yml` | Daily 23:30 UTC / manual | Updates each player's WOM snapshot |

The update workflow can also be triggered manually from the **Actions** tab, which is useful when first setting up or after a long break.

## Local development

```bash
npm install
npm run dev
```

## Stack

- React 19 + TypeScript
- Vite
- Wise Old Man API (public, no auth required)
- GitHub Pages + GitHub Actions
