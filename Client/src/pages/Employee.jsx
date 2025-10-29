import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Mail, Phone, MapPin, Calendar, FileText, ArrowLeft, IndianRupee } from 'lucide-react'

const Field = ({ label, value, icon: Icon }) => {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="flex items-start gap-3">
      {Icon ? <Icon className="mt-0.5 h-4 w-4 text-slate-500" /> : null}
      <div>
        <div className="text-xs uppercase text-slate-500 tracking-wider">{label}</div>
        <div className="text-sm text-slate-900 font-semibold">{value}</div>
      </div>
    </div>
  )
}

const formatCurrency = (n) => {
  if (n === undefined || n === null || isNaN(n)) return undefined
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n)) } catch { return n }
}

const formatDate = (d) => {
  if (!d) return undefined
  const date = new Date(d)
  if (isNaN(date.getTime())) return undefined
  return date.toLocaleDateString()
}

const Employee = () => {
  const { CID } = useParams()
  const navigate = useNavigate()
  const base_url = import.meta.env.VITE_BACKEND_URL

  const [emp, setEmp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axios.get(`${base_url}/get-employee/${CID}`, { withCredentials: true })
        const data = res.data?.employee || res.data
        setEmp(data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load employee')
      } finally {
        setLoading(false)
      }
    }
    if (CID) fetchEmployee()
  }, [CID, base_url])

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <div className="mx-auto max-w-5xl rounded-lg border bg-white p-6">
          <div className="mb-4 text-red-600">{error}</div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    )
  }

  // Normalize fields from various backend keys
  const profilePicture = emp?.profilePicture || emp?.picture
  const phone = emp?.phone || emp?.phoneNumber
  const dob = emp?.dateOfBirth || emp?.dob

  // Normalize documents (supports array or object map)
  const documents = Array.isArray(emp?.documents)
    ? emp?.documents
    : emp?.documents && typeof emp.documents === 'object'
      ? Object.entries(emp.documents).map(([k, v]) => ({ key: k, name: k, url: v }))
      : []

  const prettyDocName = (keyOrName) => {
    if (!keyOrName) return 'Document'
    const key = String(keyOrName)
    // Custom friendly names
    const map = {
      aadharCard: 'Aadhaar Card',
      aadhaarCard: 'Aadhaar Card',
      panCard: 'PAN Card',
      drivingLicense: 'Driving License',
      resume: 'Resume',
    }
    if (map[key]) return map[key]
    // Fallback: split camelCase
    return key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (s) => s.toUpperCase())
  }

  return (
    <div className="p-6 md:p-8 w-full">
      <div className="mx-auto w-full max-w-none">
        {/* Header */}
        <div className="flex flex-col gap-6 rounded-xl border bg-white p-6 md:flex-row md:items-center">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profilePicture} alt={emp?.name} />
            <AvatarFallback>
              {emp?.name ? emp.name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase() : 'EMP'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">{emp?.name || 'Unnamed Employee'}</h1>
              {emp?.role ? <Badge variant="secondary" className="text-sm px-3 py-1">{emp.role}</Badge> : null}
              {emp?.CID ? <Badge className="bg-slate-900 text-white hover:bg-slate-800 text-sm px-3 py-1">CID: {emp.CID}</Badge> : null}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
              {emp?.email ? (
                <span className="inline-flex items-center gap-1"><Mail className="h-4 w-4" /> {emp.email}</span>
              ) : null}
              {phone ? (
                <span className="inline-flex items-center gap-1"><Phone className="h-4 w-4" /> {phone}</span>
              ) : null}
              {emp?.salary ? (
                <span className="inline-flex items-center gap-1"><IndianRupee className="h-4 w-4" /> {formatCurrency(emp.salary)}</span>
              ) : null}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Details grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="text-sm font-medium text-slate-900">Personal Information</div>
              <Field label="Gender" value={emp?.gender} />
              <Field label="Date of Birth" value={formatDate(dob)} icon={Calendar} />
              <Field label="Email" value={emp?.email} icon={Mail} />
              <Field label="Phone" value={phone} icon={Phone} />
              <Field label="Address" value={emp?.address} icon={MapPin} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="text-sm font-medium text-slate-900">Employment Details</div>
              <Field label="Role" value={emp?.role} />
              <Field label="Department" value={emp?.department} />
              <Field label="Salary" value={formatCurrency(emp?.salary)} />
              <Field label="Joining Date" value={formatDate(emp?.joiningDate)} icon={Calendar} />
              <Field label="Status" value={emp?.status} />
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="space-y-4 p-6">
              <div className="text-sm font-medium text-slate-900">Documents</div>
              {documents && documents.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {documents.map((doc, idx) => (
                    <Button key={idx} variant="outline" size="sm" asChild>
                      <a href={doc?.url} target="_blank" rel="noopener noreferrer">
                        <FileText className="mr-2 h-4 w-4" /> {prettyDocName(doc?.name || doc?.key) }
                      </a>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500">No documents uploaded.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Employee