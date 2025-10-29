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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, UserX, ArrowRight, Calendar, FileText, User, Phone, Mail } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const PHASE_COLORS = {
  applied: 'bg-slate-100 text-slate-800 border-slate-200',
  screening: 'bg-blue-50 text-blue-700 border-blue-200',
  technical: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  managerial: 'bg-amber-50 text-amber-800 border-amber-200',
  hr: 'bg-rose-50 text-rose-700 border-rose-200',
  behavioral: 'bg-teal-50 text-teal-700 border-teal-200',
  offer: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  hired: 'bg-emerald-100 text-emerald-900 border-emerald-200',
}

const STATUS_COLORS = {
  'pending': 'bg-slate-100 text-slate-700 border-slate-200',
  'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
  'completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'skipped': 'bg-zinc-100 text-zinc-700 border-zinc-200',
}

const formatDate = (d) => {
  if (!d) return ''
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return ''
  return dt.toLocaleDateString()
}

const CandidateManagement = () => {
  const base_url = import.meta.env.VITE_BACKEND_URL
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Phase quick edit form state
  const [phaseEdit, setPhaseEdit] = useState({}) // { [candidateId]: { phaseName, scheduledAt, interviewer, feedback, score, status } }
  const [actionBusy, setActionBusy] = useState('') // candidateId while calling advance/reject

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.get(`${base_url}/candidates`, { withCredentials: true })
      setCandidates(res.data?.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load candidates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleAdvance = async (c) => {
    setActionBusy(c._id)
    setError('')
    try {
      await axios.post(`${base_url}/candidates/${c._id}/advance`, {}, { withCredentials: true })
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to advance candidate')
    } finally {
      setActionBusy('')
    }
  }

  const handleReject = async (c) => {
    setActionBusy(c._id)
    setError('')
    try {
      await axios.post(`${base_url}/candidates/${c._id}/reject`, { reason: 'HR decision' }, { withCredentials: true })
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject candidate')
    } finally {
      setActionBusy('')
    }
  }

  const savePhaseEdit = async (c) => {
    const edit = phaseEdit[c._id]
    if (!edit || !edit.phaseName) return
    setActionBusy(c._id)
    setError('')
    try {
      await axios.patch(`${base_url}/candidates/${c._id}/phase/${edit.phaseName}`, edit, { withCredentials: true })
      setPhaseEdit((s) => ({ ...s, [c._id]: {} }))
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update phase')
    } finally {
      setActionBusy('')
    }
  }

  const phaseChip = (c) => (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${PHASE_COLORS[c.currentPhase] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>{c.currentPhase.toUpperCase()}</span>
  )

  const getAvatarUrl = (name) => {
    const parts = (name || 'Candidate').trim().split(/\s+/).map(encodeURIComponent).join('+')
    return `https://avatar.iran.liara.run/username?username=${parts}`
  }

  const getInitials = (name) => {
    if (!name) return 'CN'
    const parts = name.trim().split(/\s+/)
    return parts.slice(0,2).map(s=>s[0]?.toUpperCase()||'').join('') || 'CN'
  }

  return (
  <div className="p-3 md:p-4 w-full">
      <div className="mx-auto w-full max-w-none space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            {/* <h1 className="text-2xl font-bold tracking-tight text-slate-900">Candidate Management</h1>
            <p className="text-sm text-slate-500">Track candidates through interview phases and take action with one click.</p> */}
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="grid gap-6">
          {/* Candidates list full width */}
          <Card className="lg:col-span-3">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-900">Candidates</div>
                {loading ? <Spinner className="h-4 w-4" /> : null}
              </div>
              <Separator className="my-4" />

              {loading ? (
                <div className="text-sm text-slate-500">Loading…</div>
              ) : candidates.length === 0 ? (
                <div className="text-sm text-slate-500">No candidates yet.</div>
              ) : (
                <div className="divide-y">
                  {candidates.map((c) => (
                    <Collapsible key={c._id}>
                      <div className="flex items-center gap-3 py-3">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="px-2 hover:bg-transparent">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </CollapsibleTrigger>
                        <div className="flex-1 grid md:grid-cols-5 gap-2 items-center">
                          <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={getAvatarUrl(c.name)} alt={c.name} />
                              <AvatarFallback>{getInitials(c.name)}</AvatarFallback>
                            </Avatar>
                            {c.name}
                          </div>
                          <div className="text-xs text-slate-600 flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {c.email}</div>
                          <div className="text-xs text-slate-600 flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {c.phone || '—'}</div>
                          <div className="text-xs text-slate-600 flex items-center gap-2"><FileText className="h-3.5 w-3.5" /> {c.roleApplied || '—'}</div>
                          <div className="flex items-center gap-2 justify-end">
                            {phaseChip(c)}
                            <Button size="sm" variant="outline" disabled={actionBusy===c._id || c.status !== 'active'} onClick={() => handleAdvance(c)}>
                              <ArrowRight className="mr-1 h-4 w-4" /> Advance
                            </Button>
                            <Button size="sm" variant="destructive" disabled={actionBusy===c._id || c.status !== 'active'} onClick={() => handleReject(c)}>
                              <UserX className="mr-1 h-4 w-4" /> Reject
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded tracker */}
                      <CollapsibleContent>
                        <div className="mb-4 ml-10 space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {(c.phases || []).map((p) => (
                              <span key={p.name} className={`inline-flex items-center gap-2 rounded border px-2 py-1 text-xs ${STATUS_COLORS[p.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                <Badge variant="secondary" className={`${PHASE_COLORS[p.name] || 'bg-slate-100 text-slate-700 border-slate-200'} border`}>{p.name}</Badge>
                                <span>{p.status}</span>
                                {p.scheduledAt ? (<span className="inline-flex items-center gap-1 text-slate-600"><Calendar className="h-3.5 w-3.5" /> {formatDate(p.scheduledAt)}</span>) : null}
                              </span>
                            ))}
                          </div>

                          {/* Quick edit for current phase */}
                          <div className="rounded-md border p-3">
                            <div className="text-xs font-medium text-slate-900 mb-2">Edit current phase</div>
                            <div className="grid gap-2 md:grid-cols-6">
                              <div className="grid gap-1.5 md:col-span-2">
                                <Label>Phase</Label>
                                <Select value={phaseEdit[c._id]?.phaseName || c.currentPhase} onValueChange={(v) => setPhaseEdit((s)=>({ ...s, [c._id]: { ...(s[c._id]||{}), phaseName: v } }))}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(c.phases||[]).map(p => (
                                      <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-1.5">
                                <Label>Schedule</Label>
                                <Input type="date" value={phaseEdit[c._id]?.scheduledAt || ''} onChange={(e)=>setPhaseEdit((s)=>({ ...s, [c._id]: { ...(s[c._id]||{}), scheduledAt: e.target.value } }))} />
                              </div>
                              <div className="grid gap-1.5">
                                <Label>Interviewer</Label>
                                <Input value={phaseEdit[c._id]?.interviewer || ''} onChange={(e)=>setPhaseEdit((s)=>({ ...s, [c._id]: { ...(s[c._id]||{}), interviewer: e.target.value } }))} />
                              </div>
                              <div className="grid gap-1.5">
                                <Label>Status</Label>
                                <Select value={phaseEdit[c._id]?.status || ''} onValueChange={(v) => setPhaseEdit((s)=>({ ...s, [c._id]: { ...(s[c._id]||{}), status: v } }))}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="skipped">Skipped</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-1.5">
                                <Label>Score</Label>
                                <Select value={String(phaseEdit[c._id]?.score || '')} onValueChange={(v) => setPhaseEdit((s)=>({ ...s, [c._id]: { ...(s[c._id]||{}), score: Number(v) } }))}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="NA" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[5,4,3,2,1].map(n => (
                                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-1.5 md:col-span-6">
                                <Label>Feedback</Label>
                                <Textarea rows={2} value={phaseEdit[c._id]?.feedback || ''} onChange={(e)=>setPhaseEdit((s)=>({ ...s, [c._id]: { ...(s[c._id]||{}), feedback: e.target.value } }))} />
                              </div>
                            </div>
                            <div className="mt-3 flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={()=>setPhaseEdit((s)=>({ ...s, [c._id]: {} }))}>Reset</Button>
                              <Button size="sm" disabled={actionBusy===c._id} onClick={()=>savePhaseEdit(c)}>Save</Button>
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add-candidate form removed as requested; candidates are added via Postman now. */}
        </div>
      </div>
    </div>
  )
}

export default CandidateManagement