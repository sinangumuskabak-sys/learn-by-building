import {
  BarChart3,
  Blocks,
  BookOpen,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Circle,
  CircleDot,
  Cloud,
  Code2,
  Database,
  FileCode2,
  FlaskConical,
  Gauge,
  LayoutTemplate,
  ListChecks,
  type LucideIcon,
  PenTool,
  Rocket,
  Server,
  ShieldCheck,
  Table2,
  Wrench,
} from 'lucide-react'
import type { ChallengeType } from '../content/schema.ts'
import type { ChallengeStatus } from '../progress/progress.ts'

/** Category icons are referenced by name from curriculum.json. */
const categoryIcons: Record<string, LucideIcon> = {
  code: Code2,
  wrench: Wrench,
  blocks: Blocks,
  brain: BrainCircuit,
  bot: Bot,
  flask: FlaskConical,
  shield: ShieldCheck,
  database: Database,
  server: Server,
  layout: LayoutTemplate,
  cloud: Cloud,
  gauge: Gauge,
  rocket: Rocket,
  chart: BarChart3,
}

export function CategoryIcon({ name, size = 20, className }: { name: string; size?: number; className?: string }) {
  const Icon = categoryIcons[name] ?? BookOpen
  return <Icon size={size} className={className} aria-hidden />
}

const typeIcons: Record<ChallengeType, LucideIcon> = {
  'code-js': FileCode2,
  'code-ts': FileCode2,
  web: LayoutTemplate,
  sql: Table2,
  quiz: ListChecks,
  read: BookOpen,
  design: PenTool,
}

export function TypeIcon({ type, size = 16, className }: { type: ChallengeType; size?: number; className?: string }) {
  const Icon = typeIcons[type]
  return <Icon size={size} className={className} aria-hidden />
}

export function StatusIcon({ status, label }: { status: ChallengeStatus; label: string }) {
  if (status === 'passed') return <CheckCircle2 size={18} className="shrink-0 text-success" aria-label={label} />
  if (status === 'started') return <CircleDot size={18} className="shrink-0 text-accent" aria-label={label} />
  return <Circle size={18} className="shrink-0 text-border" aria-label={label} />
}
