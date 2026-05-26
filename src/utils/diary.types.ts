export interface SkillGain {
  metric: string;
  xpGained: number;
  levelStart: number;
  levelEnd: number;
}

export interface BossKill {
  metric: string;
  killsGained: number;
}

export interface ActivityGain {
  metric: string;
  scoreGained: number;
}

export interface LevelUp {
  metric: string;
  from: number;
  to: number;
}

export interface PlayerDayEntry {
  name: string;
  skills: SkillGain[];
  bosses: BossKill[];
  activities: ActivityGain[];
  levelUps: LevelUp[];
  totalXpGained: number;
}

export interface DayEntry {
  date: string;
  players: PlayerDayEntry[];
  totalXpGained: number;
  totalBossKills: number;
  totalClues: number;
  totalLevelUps: number;
}
