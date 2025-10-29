import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

// Simple color palette
const COLORS = [
  '#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#22C55E', '#14B8A6', '#F97316', '#3B82F6'
]

const sum = (arr) => arr.reduce((a, b) => a + b, 0)

// Donut chart using CSS conic-gradient
const Donut = ({ segments }) => {
  const total = segments.reduce((acc, s) => acc + s.value, 0) || 1
  let current = 0
  const gradient = segments.map((s, i) => {
    const start = (current / total) * 360
    const angle = (s.value / total) * 360
    const end = start + angle
    current += s.value
    return `${s.color} ${start}deg ${end}deg`
  }).join(', ')

  return (
    <div className="relative h-40 w-40">
      <div
        className="h-full w-full rounded-full"
        style={{ background: `conic-gradient(${gradient})` }}
      />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 rounded-full bg-white" />
    </div>
  )
}

// Simple bar chart with inline SVG
const Bars = ({ data, height = 90 }) => {
  const max = Math.max(1, ...data.map(d => d.value))
  const barW = 24
  const gap = 10
  const width = data.length * barW + (data.length - 1) * gap
  return (
    <svg width={width} height={height} role="img" aria-label="bar-chart">
      {data.map((d, i) => {
        const h = Math.round((d.value / max) * (height - 16))
        const x = i * (barW + gap)
        const y = height - h
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} rx="4" fill={d.color || '#6366F1'} />
            <title>{`${d.label}: ${d.value}`}</title>
          </g>
        )
      })}
    </svg>
  )
}

const Analytics = () => {
  const base_url = import.meta.env.VITE_BACKEND_URL
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [userName, setUserName] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [meRes, sumRes] = await Promise.all([
        axios.get(`${base_url}/me`, { withCredentials: true }),
        axios.get(`${base_url}/analytics/summary`, { withCredentials: true }),
      ])
      setUserName(meRes.data?.name || meRes.data?.email || 'User')
      setData(sumRes.data?.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const roleSegments = useMemo(() => {
    const roles = data?.employees?.roles || []
    return roles.map((r, i) => ({
      label: r.role || 'Unknown',
      value: r.count || 0,
      color: COLORS[i % COLORS.length],
    }))
  }, [data])

  const hiresSeries = useMemo(() => {
    return (data?.employees?.hiresByMonth || []).map((m, i) => ({
      label: m.month,
      value: m.count,
      color: COLORS[i % COLORS.length],
    }))
  }, [data])

  const phasesSeries = useMemo(() => {
    return (data?.candidates?.phaseCounts || []).map((p, i) => ({
      label: p.phase,
      value: p.count,
      color: COLORS[i % COLORS.length],
    }))
  }, [data])

  const eventsSeries = useMemo(() => {
    return (data?.attendance?.eventsByType || []).map((e, i) => ({
      label: e.type || 'other',
      value: e.count || 0,
      color: COLORS[i % COLORS.length],
    }))
  }, [data])

  return (
  <div className="p-3 md:p-4 w-full">
      <div className="mx-auto w-full max-w-none space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome, {userName || '—'} 👋</h1>
            {/* <p className="text-sm text-slate-500">Here’s a quick snapshot across Employees, Attendance, Performance, and Candidates.</p> */}
          </div>
          {loading ? <Spinner className="h-5 w-5" /> : null}
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        ) : null}

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="text-xs text-slate-500">Employees</div>
              <div className="mt-1 text-2xl font-semibold">{data?.employees?.total ?? '—'}</div>
              <div className="mt-2 text-xs text-slate-500">Roles: {data?.employees?.roles?.length ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="text-xs text-slate-500">Projects</div>
              <div className="mt-1 text-2xl font-semibold">{(data?.performance?.activeProjects ?? 0) + (data?.performance?.completedProjects ?? 0)}</div>
              <div className="mt-2 text-xs text-slate-500">Active: {data?.performance?.activeProjects ?? 0} • Completed: {data?.performance?.completedProjects ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="text-xs text-slate-500">Candidates in pipeline</div>
              <div className="mt-1 text-2xl font-semibold">{data?.candidates?.total ?? '—'}</div>
              <div className="mt-2 text-xs text-slate-500">Hired: {data?.candidates?.statusCounts?.hired ?? 0} • Rejected: {data?.candidates?.statusCounts?.rejected ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="text-xs text-slate-500">Average client rating</div>
              <div className="mt-1 text-2xl font-semibold">{data?.performance?.avgRating ?? 0}</div>
              <div className="mt-2 text-xs text-slate-500">Feedbacks: {data?.performance?.feedbackCount ?? 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts & details */}
        <div className="grid gap-6 xl:grid-cols-3">
          {/* Roles distribution */}
          <Card className="xl:col-span-1">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-medium text-slate-900">Role distribution</div>
                <Badge variant="secondary">Employees</Badge>
              </div>
              {roleSegments.length ? (
                <div className="flex items-center gap-6">
                  <Donut segments={roleSegments} />
                  <div className="grid gap-2">
                    {roleSegments.map((s) => (
                      <div key={s.label} className="flex items-center justify-between gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: s.color }} />
                          <span className="text-slate-700">{s.label}</span>
                        </div>
                        <span className="font-medium">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500">No role data</div>
              )}
            </CardContent>
          </Card>

          {/* Hires by month */}
          <Card className="xl:col-span-2">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-medium text-slate-900">Hires by month</div>
                <Badge variant="outline">Employees</Badge>
              </div>
              {hiresSeries.length ? (
                <div className="flex items-end justify-between gap-4">
                  <Bars data={hiresSeries} height={110} />
                </div>
              ) : (
                <div className="text-sm text-slate-500">No hire trend data</div>
              )}
              <Separator className="my-4" />
              <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                {hiresSeries.map(d => (
                  <span key={d.label} className="inline-flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded" style={{ backgroundColor: d.color }} />
                    {d.label}: <span className="font-medium text-slate-800">{d.value}</span>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          {/* Attendance summary */}
          <Card className="xl:col-span-1">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-medium text-slate-900">Attendance (last 30 days)</div>
                <Badge variant="secondary">Attendance</Badge>
              </div>
              <div className="flex gap-3">
                {['present','absent','leave'].map((k, i) => (
                  <div key={k} className={cn('rounded-md border px-3 py-2',
                    i===0 && 'bg-emerald-50 border-emerald-200',
                    i===1 && 'bg-rose-50 border-rose-200',
                    i===2 && 'bg-amber-50 border-amber-200'
                  )}>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">{k}</div>
                    <div className="text-xl font-semibold">{data?.attendance?.last30?.[k] ?? 0}</div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div>
                <div className="mb-2 text-xs font-medium text-slate-900">Events by type</div>
                {eventsSeries.length ? (
                  <div className="space-y-2">
                    {eventsSeries.map(e => (
                      <div key={e.label} className="flex items-center gap-3">
                        <div className="w-28 text-xs text-slate-600">{e.label}</div>
                        <div className="flex-1 h-2 rounded bg-slate-100">
                          <div className="h-2 rounded" style={{ width: `${Math.min(100, (e.value / Math.max(1, Math.max(...eventsSeries.map(x=>x.value)))))*100}%`, backgroundColor: e.color }} />
                        </div>
                        <div className="w-8 text-xs text-right font-medium">{e.value}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">No events in the period</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance snapshot */}
          <Card className="xl:col-span-1">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-medium text-slate-900">Performance snapshot</div>
                <Badge variant="outline">Projects</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-emerald-600">Active</div>
                  <div className="text-xl font-semibold text-emerald-900">{data?.performance?.activeProjects ?? 0}</div>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-slate-600">Completed</div>
                  <div className="text-xl font-semibold text-slate-900">{data?.performance?.completedProjects ?? 0}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-slate-600 mb-2">Average rating</div>
                  <div className="flex items-center gap-2">
                    <div className="relative h-2 flex-1 rounded bg-slate-100">
                      <div className="absolute left-0 top-0 h-2 rounded bg-amber-400" style={{ width: `${(Math.min(5, data?.performance?.avgRating || 0) / 5) * 100}%` }} />
                    </div>
                    <div className="text-sm font-medium tabular-nums">{data?.performance?.avgRating ?? 0}/5</div>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">Feedbacks: <span className="font-medium text-slate-800">{data?.performance?.feedbackCount ?? 0}</span></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Candidates pipeline */}
          <Card className="xl:col-span-1">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-medium text-slate-900">Candidates pipeline</div>
                <Badge variant="secondary">Hiring</Badge>
              </div>
              {phasesSeries.length ? (
                <div className="space-y-2">
                  {phasesSeries.map(p => (
                    <div key={p.label} className="flex items-center gap-3">
                      <div className="w-28 text-xs text-slate-600">{p.label}</div>
                      <div className="flex-1 h-2 rounded bg-slate-100">
                        <div className="h-2 rounded" style={{ width: `${Math.min(100, (p.value / Math.max(1, Math.max(...phasesSeries.map(x=>x.value)))))*100}%`, backgroundColor: p.color }} />
                      </div>
                      <div className="w-8 text-xs text-right font-medium">{p.value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500">No pipeline data</div>
              )}
              <Separator className="my-4" />
              <div className="flex gap-3">
                {['active','hired','rejected'].map((k,i)=> (
                  <div key={k} className={cn('rounded-md border px-3 py-2',
                    i===0 && 'bg-blue-50 border-blue-200',
                    i===1 && 'bg-emerald-50 border-emerald-200',
                    i===2 && 'bg-rose-50 border-rose-200'
                  )}>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">{k}</div>
                    <div className="text-xl font-semibold">{data?.candidates?.statusCounts?.[k] ?? 0}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Analytics