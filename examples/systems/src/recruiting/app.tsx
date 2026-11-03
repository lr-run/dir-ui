// Recruiting (採用管理): candidates, positions and interview rounds, with a pipeline dashboard and a schedule.
import { CalendarDaysIcon, LayoutDashboardIcon, UserRoundSearchIcon } from 'lucide-react'
import { KitApp } from '@/components/systems/kit/app.tsx'
import type { KitConfig } from '@/components/systems/kit/types.ts'
import { candidates, icon, interviews, me, positions, users } from '@/components/systems/recruiting/objects.tsx'
import {
  pipelineActions,
  pipelinePage,
  scheduleInterviewAction,
  schedulePage,
} from '@/components/systems/recruiting/pages.tsx'
import { seed } from '@/components/systems/recruiting/seed.ts'

export const recruiting: KitConfig = {
  id: 'recruiting',
  brand: { name: 'Hiring', mark: <UserRoundSearchIcon size={16} strokeWidth={2} aria-hidden='true' /> },
  objects: [{ ...candidates, detail: { actions: scheduleInterviewAction } }, interviews, positions],
  pages: [
    {
      id: 'pipeline',
      label: 'Pipeline',
      icon: <LayoutDashboardIcon {...icon} />,
      actions: pipelineActions,
      render: pipelinePage,
    },
    { id: 'schedule', label: 'Schedule', icon: <CalendarDaysIcon {...icon} />, render: schedulePage },
  ],
  navigation: [
    { items: ['pipeline', 'candidates', 'schedule', 'interviews'] },
    { label: 'Openings', items: ['positions'] },
  ],
  home: '/pipeline',
  users,
  me,
  seed,
}
export function RecruitingApp({ count, basePath }: { count?: number; basePath?: string }) {
  return <KitApp config={recruiting} layout='app' count={count} basePath={basePath} />
}
