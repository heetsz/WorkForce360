import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Star, Briefcase, UserSquare2, Building2, Calendar, Plus } from 'lucide-react'

const formatDate = (d) => {
  if (!d) return ''
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return ''
  return dt.toLocaleDateString()
}

const Stars = ({ rating = 0 }) => {
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.5
  return (
    <div className="inline-flex items-center gap-0.5">
      {[0,1,2,3,4].map((i) => (
        <Star key={i} className={`${i < full ? 'fill-yellow-400 text-yellow-400' : i === full && hasHalf ? 'fill-yellow-300 text-yellow-300' : 'text-slate-300'} h-4 w-4`} />
      ))}
      <span className="ml-1 text-xs text-slate-600">{Number(rating).toFixed(1)}</span>
    </div>
  )
}

const StatusPill = ({ status }) => {
  const map = {
    'active': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'completed': 'bg-slate-100 text-slate-700 border-slate-200',
    'on-hold': 'bg-amber-50 text-amber-700 border-amber-200',
  }
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${map[status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>{status}</span>
  )
}

const Performance = () => {
  const base_url = import.meta.env.VITE_BACKEND_URL

  const [employees, setEmployees] = useState([])
  const [perf, setPerf] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // filters
  const [statusFilter, setStatusFilter] = useState('all')
  const [minRating, setMinRating] = useState(0)

  // forms
  const [assign, setAssign] = useState({ CID: '', projectName: '', clientName: '', role: '', startDate: '', endDate: '', status: 'active' })
  const [feedback, setFeedback] = useState({ performanceId: '', rating: 5, comment: '', givenBy: '', date: '' })
  const [submittingAssign, setSubmittingAssign] = useState(false)
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [empRes, perfRes] = await Promise.all([
          axios.get(`${base_url}/get-employees`, { withCredentials: true }),
          axios.get(`${base_url}/performance`, { withCredentials: true }),
        ])
        setEmployees(empRes.data?.employees || [])
        setPerf(perfRes.data?.data || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [base_url])

  const perfByEmployee = useMemo(() => {
    const map = {}
    for (const p of perf) {
      if (!map[p.CID]) map[p.CID] = []
      map[p.CID].push(p)
    }
    return map
  }, [perf])

  const employeesWithPerf = useMemo(() => {
    return employees.map((e) => {
      const projects = (perfByEmployee[e.CID] || [])
        .filter(p => statusFilter === 'all' ? true : p.status === statusFilter)
        .filter(p => (p.avgRating || 0) >= minRating)
      return { ...e, projects }
    })
  }, [employees, perfByEmployee, statusFilter, minRating])

  const refreshPerf = async () => {
    const res = await axios.get(`${base_url}/performance`, { withCredentials: true })
    setPerf(res.data?.data || [])
  }

  const handleAssign = async (e) => {
    e.preventDefault()
    if (!assign.CID || !assign.projectName) return setError('Please select employee and project name')
    setSubmittingAssign(true)
    setError('')
    try {
      await axios.post(`${base_url}/performance/assign`, assign, { withCredentials: true })
      setAssign({ CID: '', projectName: '', clientName: '', role: '', startDate: '', endDate: '', status: 'active' })
      await refreshPerf()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign project')
    } finally {
      setSubmittingAssign(false)
    }
  }

  const handleFeedback = async (e) => {
    e.preventDefault()
    if (!feedback.performanceId || !feedback.rating) return setError('Select project and rating')
    setSubmittingFeedback(true)
    setError('')
    try {
      await axios.post(`${base_url}/performance/feedback`, feedback, { withCredentials: true })
      setFeedback({ performanceId: '', rating: 5, comment: '', givenBy: '', date: '' })
      await refreshPerf()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add feedback')
    } finally {
      setSubmittingFeedback(false)
    }
  }

  return (
  <div className="p-3 md:p-4 w-full">
      <div className="mx-auto w-full max-w-none space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Performance</h1>
            <p className="text-sm text-slate-500">Projects and client feedback across all employees.</p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Min Rating</Label>
              <Select value={String(minRating)} onValueChange={(v) => setMinRating(Number(v))}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0,1,2,3,4,5].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}+</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Employees + projects grid */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-900">All Employees</div>
                {loading ? <Spinner className="h-4 w-4" /> : null}
              </div>
              <Separator className="my-4" />

              {loading ? (
                <div className="text-sm text-slate-500">Loading…</div>
              ) : employeesWithPerf.length === 0 ? (
                <div className="text-sm text-slate-500">No employees found.</div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {employeesWithPerf.map((emp) => (
                    <div key={emp._id || emp.CID} className="rounded-lg border bg-white p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserSquare2 className="h-5 w-5 text-slate-500" />
                          <div>
                            <div className="font-semibold text-slate-900">{emp.name || 'Unnamed'}</div>
                            <div className="text-xs text-slate-500">CID: {emp.CID}{emp.department ? ` • ${emp.department}` : ''}</div>
                          </div>
                        </div>
                        <Badge variant="secondary">{(emp.projects || []).length} proj</Badge>
                      </div>

                      {(emp.projects || []).length === 0 ? (
                        <div className="text-sm text-slate-500">No projects assigned.</div>
                      ) : (
                        <ul className="space-y-3">
                          {emp.projects.map((p) => (
                            <li key={p._id} className="rounded-md border p-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2 font-medium text-slate-900">
                                    <Briefcase className="h-4 w-4 text-slate-500" /> {p.projectName}
                                  </div>
                                  <div className="mt-0.5 text-xs text-slate-600 flex flex-wrap items-center gap-2">
                                    {p.clientName ? (<span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {p.clientName}</span>) : null}
                                    {p.role ? <span>• {p.role}</span> : null}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <StatusPill status={p.status} />
                                  <div className="mt-1"><Stars rating={p.avgRating} /></div>
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-slate-600 flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{formatDate(p.startDate)}{p.endDate ? ` — ${formatDate(p.endDate)}` : ''}</span>
                              </div>
                              {p.feedbacks && p.feedbacks.length > 0 ? (
                                <div className="mt-2 space-y-1">
                                  {p.feedbacks.slice(-2).reverse().map((f, idx) => (
                                    <div key={idx} className="text-xs text-slate-700">
                                      <span className="font-medium">{formatDate(f.date)}</span> • {f.comment || 'No comment'} ({f.rating}/5)
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Side forms */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900"><Plus className="h-4 w-4" /> Assign Project</div>
                <form onSubmit={handleAssign} className="space-y-3">
                  <div className="grid gap-1.5">
                    <Label>Employee</Label>
                    <Select value={assign.CID} onValueChange={(v) => setAssign({ ...assign, CID: v })}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map(e => (
                          <SelectItem key={e._id || e.CID} value={e.CID}>
                            <span className="font-medium">{e.name || 'Unnamed'}</span> <span className="text-slate-500">• CID: {e.CID}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="pname">Project Name</Label>
                    <Input id="pname" value={assign.projectName} onChange={(e) => setAssign({ ...assign, projectName: e.target.value })} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="cname">Client Name</Label>
                    <Input id="cname" value={assign.clientName} onChange={(e) => setAssign({ ...assign, clientName: e.target.value })} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" value={assign.role} onChange={(e) => setAssign({ ...assign, role: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="start">Start Date</Label>
                      <Input id="start" type="date" value={assign.startDate} onChange={(e) => setAssign({ ...assign, startDate: e.target.value })} />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="end">End Date</Label>
                      <Input id="end" type="date" value={assign.endDate} onChange={(e) => setAssign({ ...assign, endDate: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Status</Label>
                    <Select value={assign.status} onValueChange={(v) => setAssign({ ...assign, status: v })}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={submittingAssign} className="w-full">{submittingAssign ? <Spinner className="mr-2" /> : null} Assign</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900"><Plus className="h-4 w-4" /> Add Feedback</div>
                <form onSubmit={handleFeedback} className="space-y-3">
                  <div className="grid gap-1.5">
                    <Label>Project</Label>
                    <Select value={feedback.performanceId} onValueChange={(v) => setFeedback({ ...feedback, performanceId: v })}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {perf.map(p => (
                          <SelectItem key={p._id} value={p._id}>
                            <span className="font-medium">{p.projectName}</span> <span className="text-slate-500">• {p.employee?.name || p.CID}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Rating</Label>
                    <Select value={String(feedback.rating)} onValueChange={(v) => setFeedback({ ...feedback, rating: Number(v) })}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5,4,3,2,1].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="fdate">Date</Label>
                    <Input id="fdate" type="date" value={feedback.date} onChange={(e) => setFeedback({ ...feedback, date: e.target.value })} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="givenBy">Given By</Label>
                    <Input id="givenBy" placeholder="Client contact (optional)" value={feedback.givenBy} onChange={(e) => setFeedback({ ...feedback, givenBy: e.target.value })} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="comment">Comment</Label>
                    <Textarea id="comment" rows={3} placeholder="Feedback details" value={feedback.comment} onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })} />
                  </div>
                  <Button type="submit" disabled={submittingFeedback} className="w-full">{submittingFeedback ? <Spinner className="mr-2" /> : null} Add</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Performance