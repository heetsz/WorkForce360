import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Moon,
  Clock4,
  Gift,
  Wallet,
  Trophy,
  Sparkles,
  CircleDot
} from 'lucide-react'

const formatDate = (d) => {
  if (!d) return ''
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return ''
  return dt.toLocaleDateString()
}

const formatTime = (t) => {
  if (!t) return ''
  // Expecting HH:mm or ISO; display as-is if short
  if (/^\d{1,2}:\d{2}$/.test(t)) return t
  const dt = new Date(t)
  return isNaN(dt.getTime()) ? String(t) : dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const TypeBadge = ({ type }) => {
  if (!type) return null
  const map = {
    attendance: 'bg-blue-50 text-blue-700 border-blue-200',
    event: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${map[type] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
      {type.toUpperCase()}
    </span>
  )
}

const StatusChip = ({ status }) => {
  if (!status) return null
  const iconMap = {
    present: <CheckCircle2 className="h-3.5 w-3.5" />,
    absent: <XCircle className="h-3.5 w-3.5" />,
    leave: <Moon className="h-3.5 w-3.5" />,
  }
  const colorMap = {
    present: 'bg-green-50 text-green-700 border-green-200',
    absent: 'bg-red-50 text-red-700 border-red-200',
    leave: 'bg-amber-50 text-amber-700 border-amber-200',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium ${colorMap[status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
      {iconMap[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

const EventChip = ({ eventType }) => {
  if (!eventType) return null
  const iconMap = {
    'salary-credit': <Wallet className="h-3.5 w-3.5" />,
    birthday: <Gift className="h-3.5 w-3.5" />,
    'work-anniversary': <Sparkles className="h-3.5 w-3.5" />,
    holiday: <Trophy className="h-3.5 w-3.5" />,
    custom: <CircleDot className="h-3.5 w-3.5" />,
  }
  const pretty = (s) => s.replace(/-/g, ' ').replace(/^./, (x) => x.toUpperCase())
  return (
    <span className="inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 border-indigo-200">
      {iconMap[eventType] || <CircleDot className="h-3.5 w-3.5" />} {pretty(eventType)}
    </span>
  )
}

const EmployeesAttendance = () => {
  const base_url = import.meta.env.VITE_BACKEND_URL

  const [employees, setEmployees] = useState([])
  const [selectedCID, setSelectedCID] = useState('')
  const [attendance, setAttendance] = useState([])

  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [error, setError] = useState('')

  // Form state for adding entry
  const [form, setForm] = useState({
    date: '',
    type: 'attendance',
    status: 'present',
    eventType: 'salary-credit',
    checkIn: '',
    checkOut: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadEmployees = async () => {
      setLoadingEmployees(true)
      setError('')
      try {
        const res = await axios.get(`${base_url}/get-employees`, { withCredentials: true })
        const list = res.data?.employees || []
        setEmployees(list)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load employees')
      } finally {
        setLoadingEmployees(false)
      }
    }
    loadEmployees()
  }, [base_url])

  useEffect(() => {
    const loadAttendance = async () => {
      if (!selectedCID) return
      setLoadingAttendance(true)
      setError('')
      try {
        const res = await axios.get(`${base_url}/attendance/${selectedCID}`, { withCredentials: true })
        const list = res.data?.attendance || []
        setAttendance(list)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load attendance')
      } finally {
        setLoadingAttendance(false)
      }
    }
    loadAttendance()
  }, [base_url, selectedCID])

  const selectedEmployee = useMemo(() => employees.find(e => e.CID === selectedCID), [employees, selectedCID])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!selectedCID) return setError('Please select an employee')
    if (!form.date) return setError('Please select a date')
    if (form.type === 'attendance' && !form.status) return setError('Select status')
    if (form.type === 'event' && !form.eventType) return setError('Select event type')

    setSubmitting(true)
    setError('')
    try {
      const payload = {
        CID: selectedCID,
        date: form.date,
        type: form.type,
        notes: form.notes || undefined,
      }
      if (form.type === 'attendance') {
        payload.status = form.status
        if (form.checkIn) payload.checkIn = form.checkIn
        if (form.checkOut) payload.checkOut = form.checkOut
      } else {
        payload.eventType = form.eventType
      }
      await axios.post(`${base_url}/attendance/add`, payload, { withCredentials: true })
      // Reset minimal
      setForm((f) => ({ ...f, notes: '', checkIn: '', checkOut: '' }))
      // Refresh
      const res = await axios.get(`${base_url}/attendance/${selectedCID}`, { withCredentials: true })
      setAttendance(res.data?.attendance || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add entry')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 md:p-8 w-full">
      <div className="mx-auto w-full max-w-none space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Attendance & Events</h1>
            <p className="text-sm text-slate-500">Track attendance records and special events per employee.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="emp">Select Employee</Label>
              <Select value={selectedCID} onValueChange={setSelectedCID}>
                <SelectTrigger id="emp" className="min-w-60">
                  <SelectValue placeholder={loadingEmployees ? 'Loading…' : 'Choose employee'} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp._id || emp.CID} value={emp.CID}>
                      <span className="font-medium">{emp.name || 'Unnamed'}</span>
                      <span className="text-slate-500"> · CID: {emp.CID}</span>
                    </SelectItem>
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
          {/* Timeline */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-900">Timeline</div>
                {loadingAttendance ? <Spinner className="h-4 w-4" /> : null}
              </div>
              <Separator className="my-4" />

              {!selectedCID ? (
                <div className="text-sm text-slate-500">Select an employee to view their timeline.</div>
              ) : loadingAttendance ? (
                <div className="text-sm text-slate-500">Loading timeline…</div>
              ) : attendance.length === 0 ? (
                <div className="text-sm text-slate-500">No entries yet. Add attendance or an event from the form.</div>
              ) : (
                <ul className="relative space-y-6">
                  {/* Vertical line */}
                  <div className="absolute left-3 top-0 h-full w-px bg-slate-200" />
                  {attendance.map((item) => (
                    <li key={item._id} className="relative pl-10">
                      {/* Dot */}
                      <span className="absolute left-1.5 top-0.5 inline-flex h-3 w-3 -translate-x-1/2 items-center justify-center rounded-full bg-white ring-4 ring-white">
                        <span className={`h-3 w-3 rounded-full ${item.type === 'attendance' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                      </span>

                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-500" /> {formatDate(item.date)}
                        </div>
                        <TypeBadge type={item.type} />
                        {item.type === 'attendance' ? (
                          <StatusChip status={item.status} />
                        ) : (
                          <EventChip eventType={item.eventType} />
                        )}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        {item.type === 'attendance' ? (
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                            {item.checkIn ? (
                              <span className="inline-flex items-center gap-1"><Clock4 className="h-3.5 w-3.5" /> In: {formatTime(item.checkIn)}</span>
                            ) : null}
                            {item.checkOut ? (
                              <span className="inline-flex items-center gap-1"><Clock4 className="h-3.5 w-3.5" /> Out: {formatTime(item.checkOut)}</span>
                            ) : null}
                            {item.notes ? (
                              <span className="text-slate-700 wrap-break-word">{item.notes}</span>
                            ) : null}
                          </div>
                        ) : (
                          <>{item.notes ? <span className="text-slate-700">{item.notes}</span> : null}</>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Create entry */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="text-sm font-medium text-slate-900">Add Entry</div>
              <form onSubmit={handleCreate} className="space-y-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>

                <div className="grid gap-1.5">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="attendance">Attendance</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {form.type === 'attendance' ? (
                  <>
                    <div className="grid gap-1.5">
                      <Label>Status</Label>
                      <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="leave">Leave</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-1.5">
                        <Label htmlFor="checkIn">Check-in</Label>
                        <Input id="checkIn" placeholder="09:30" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="checkOut">Check-out</Label>
                        <Input id="checkOut" placeholder="18:15" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="grid gap-1.5">
                    <Label>Event Type</Label>
                    <Select value={form.eventType} onValueChange={(v) => setForm({ ...form, eventType: v })}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salary-credit">Salary Credit</SelectItem>
                        <SelectItem value="birthday">Birthday</SelectItem>
                        <SelectItem value="work-anniversary">Work Anniversary</SelectItem>
                        <SelectItem value="holiday">Holiday</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid gap-1.5">
                  <Label htmlFor="notes">Notes</Label>
                  <Input id="notes" placeholder="Optional details" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>

                <Button type="submit" disabled={submitting || !selectedCID} className="w-full">
                  {submitting ? <Spinner className="mr-2" /> : null}
                  Add Entry
                </Button>
              </form>

              {selectedEmployee ? (
                <div className="rounded-md border bg-slate-50 p-3 text-xs text-slate-700">
                  <div className="font-medium text-slate-900">Selected</div>
                  <div>Name: {selectedEmployee.name || 'Unnamed'}</div>
                  <div>CID: {selectedEmployee.CID}</div>
                  {selectedEmployee.department ? <div>Dept: {selectedEmployee.department}</div> : null}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default EmployeesAttendance