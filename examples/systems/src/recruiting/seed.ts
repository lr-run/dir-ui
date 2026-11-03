// Deterministic recruiting fixtures: about `count` candidates, positions and interview rounds in proportion.
import { day, random, record } from '@/components/systems/kit/seed.ts'
import type { KitRecord } from '@/components/systems/kit/types.ts'

const titles = [
  ['Backend Engineer', 'engineering', 110],
  ['Frontend Engineer', 'engineering', 100],
  ['Site Reliability Engineer', 'engineering', 120],
  ['Data Engineer', 'engineering', 115],
  ['Engineering Manager', 'engineering', 150],
  ['QA Engineer', 'engineering', 85],
  ['Product Manager', 'product', 130],
  ['Product Analyst', 'product', 90],
  ['Product Designer', 'design', 95],
  ['UX Researcher', 'design', 90],
  ['Account Executive', 'sales', 100],
  ['Sales Development Rep', 'sales', 65],
  ['Customer Success Manager', 'sales', 80],
  ['Recruiter', 'corporate', 75],
  ['Accountant', 'corporate', 70],
  ['Legal Counsel', 'corporate', 125],
] as const
const families = [
  'Tanaka',
  'Suzuki',
  'Takahashi',
  'Watanabe',
  'Yamamoto',
  'Nakamura',
  'Kobayashi',
  'Yoshida',
  'Yamada',
  'Sasaki',
  'Yamaguchi',
  'Matsumoto',
  'Inoue',
  'Kimura',
  'Shimizu',
  'Hayashi',
  'Saito',
  'Yamazaki',
  'Mori',
  'Ikeda',
  'Hashimoto',
  'Ishikawa',
  'Ogawa',
  'Fujita',
]
const givens = [
  'Haruka',
  'Ren',
  'Yui',
  'Sota',
  'Mio',
  'Haruto',
  'Aoi',
  'Yuto',
  'Rin',
  'Kaito',
  'Sakura',
  'Riku',
  'Hina',
  'Takumi',
  'Mei',
  'Kenta',
  'Nanami',
  'Shota',
  'Airi',
  'Daiki',
  'Koharu',
  'Yuma',
  'Emi',
  'Tsubasa',
]
const companies = [
  'Kanto Systems',
  'Nishikawa Trading',
  'Asahi Digital',
  'Minato Logistics',
  'Hikari Software',
  'Seiwa Bank',
  'Tokai Retail',
  'Kizuna Labs',
  'Midori Foods',
  'Sakura Consulting',
  'Hokuto Electronics',
  'Daiichi Insurance',
]
const recruiters = ['u1', 'u2', 'u3']
const roundNames = {
  'phone-screen': 'Phone screen',
  technical: 'Technical interview',
  team: 'Team interview',
  final: 'Final interview',
} as const
const roundOrder = Object.keys(roundNames) as (keyof typeof roundNames)[]
const times = ['10:00', '10:30', '11:00', '13:00', '14:00', '15:30', '16:00', '17:00']
const ago = (iso: string) => Math.round((Date.parse(day(0)) - Date.parse(iso)) / 86400000)

export function seed(count: number): Record<string, KitRecord[]> {
  const r = random(count + 31)
  const positionRecords = Array.from({ length: Math.min(40, Math.max(8, Math.ceil(count / 12))) }, (_, index) => {
    const [title, department, band] = titles[index % titles.length]!
    const round = Math.floor(index / titles.length)
    const location = round === 0 ? r.pick(['tokyo', 'tokyo', 'remote']) : ['osaka', 'fukuoka', 'remote'][round - 1]!
    const name = round === 0 ? title : `${title} · ${location[0]!.toUpperCase()}${location.slice(1)}`
    return record(`p${index + 1}`, name, {
      department,
      status: r.pick(['open', 'open', 'open', 'open', 'hold', 'filled']),
      manager: r.pick(['u4', 'u5', 'u6']),
      openings: r.int(1, 3),
      location,
      salaryMax: band * 100000,
      openedAt: day(-r.int(14, 160)),
      description: `We are hiring a ${title.toLowerCase()} to join the ${department} team.`,
    }, r.int(14, 160))
  })
  const interviewRecords: KitRecord[] = []
  const candidateRecords = Array.from({ length: count }, (_, index) => {
    const name = `${givens[(index * 7 + Math.floor(index / families.length)) % givens.length]} ${
      families[index % families.length]
    }`
    const roll = r.next()
    const stage = roll < 0.3
      ? 'applied'
      : roll < 0.52
      ? 'screening'
      : roll < 0.72
      ? 'interview'
      : roll < 0.78
      ? 'offer'
      : roll < 0.85
      ? 'hired'
      : 'rejected'
    const position = r.pick(positionRecords)
    const appliedAt = day(-r.int(stage === 'applied' ? 1 : 10, stage === 'hired' || stage === 'rejected' ? 150 : 70))
    const lastContactAt = day(-r.int(0, Math.min(ago(appliedAt), stage === 'applied' ? 25 : 30)))
    const id = `c${index + 1}`
    const band = Number(position.values.salaryMax) / 100000
    const candidate = record(id, name, {
      stage,
      position: position.id,
      recruiter: r.pick(recruiters),
      source: r.pick(['referral', 'careers-site', 'careers-site', 'linkedin', 'job-board', 'agency', 'event']),
      appliedAt,
      lastContactAt,
      expectedSalary: r.int(Math.round(band * 0.55), band) * 100000,
      company: r.pick(companies),
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@mail.example`,
      phone: `090-${r.int(1000, 9999)}-${r.int(1000, 9999)}`,
    }, ago(appliedAt))
    // Rounds held so far: screening has one, later stages more; open candidates may have the next one booked.
    const held = { applied: 0, screening: 1, interview: r.int(1, 3), offer: 4, hired: 4, rejected: r.int(1, 3) }[stage]!
    const upcoming = (stage === 'screening' || stage === 'interview') && r.next() < 0.6
    const total = Math.min(4, held + (upcoming ? 1 : 0))
    for (let round = 0; round < total; round++) {
      const next = upcoming && round === total - 1
      const daysAgo = next
        ? -r.int(0, 13)
        : Math.max(0, Math.min(ago(lastContactAt) + (total - 1 - round) * r.int(3, 7), ago(appliedAt) - 1 - round))
      const result = next
        ? 'scheduled'
        : stage === 'rejected' && round === total - 1
        ? r.pick(['failed', 'failed', 'no-show'])
        : 'passed'
      const kind = roundOrder[round]!
      interviewRecords.push(
        record(`v${interviewRecords.length + 1}`, `${name} · ${roundNames[kind]}`, {
          candidate: id,
          round: kind,
          interviewer: kind === 'phone-screen' ? candidate.values.recruiter : position.values.manager,
          scheduledAt: `${day(-daysAgo)}T${r.pick(times)}`,
          result,
          feedback: result === 'passed'
            ? r.pick(['Clear communicator; strong on fundamentals.', 'Good team fit. Move forward.', ''])
            : '',
        }, Math.max(1, daysAgo + 7)),
      )
    }
    return candidate
  })
  return { candidates: candidateRecords, positions: positionRecords, interviews: interviewRecords }
}
