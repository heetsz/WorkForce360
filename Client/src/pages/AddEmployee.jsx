import React, { useMemo, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Calendar, FileText, IndianRupee, Loader2, Upload } from 'lucide-react'

const uploadToCloudinary = async (file, { cloudName, uploadPreset }) => {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`
  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', uploadPreset)
  // Let cloudinary auto-detect resource type (image, pdf, etc.)
  form.append('resource_type', 'auto')
  const res = await fetch(url, { method: 'POST', body: form })
  if (!res.ok) throw new Error('Upload failed')
  const data = await res.json()
  return data.secure_url
}

const AddEmployee = () => {
  const navigate = useNavigate()
  const base_url = import.meta.env.VITE_BACKEND_URL
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || import.meta.env.VITE_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || import.meta.env.VITE_PRESET_NAME

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [form, setForm] = useState({
    name: '',
    role: '',
    CID: '',
    gender: '',
    dob: '',
    email: '',
    address: '',
    picture: '',
    phoneNumber: '',
    salary: '',
    documents: {
      aadharCard: '',
      panCard: '',
      drivingLicense: '',
      resume: '',
    },
  })

  const initials = useMemo(() => {
    if (!form.name) return 'EMP'
    return form.name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()
  }, [form.name])

  const onChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const onDocChange = (key, value) => {
    setForm(prev => ({ ...prev, documents: { ...prev.documents, [key]: value } }))
  }

  const handleUpload = async (file, target) => {
    if (!file) return
    try {
      setMessage('Uploading...')
      const url = await uploadToCloudinary(file, { cloudName, uploadPreset })
      if (target === 'picture') {
        setForm(prev => ({ ...prev, picture: url }))
      } else {
        onDocChange(target, url)
      }
      setMessage('')
    } catch (err) {
      console.error(err)
      setMessage('Upload failed. Please try again.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      // Build payload excluding empty strings so backend defaults apply
      const payload = {}
      Object.entries(form).forEach(([key, val]) => {
        if (key === 'documents') return
        if (val !== '' && val !== null && val !== undefined) {
          payload[key] = val
        }
      })
      // Normalize numeric/date fields
      if (form.salary) payload.salary = Number(form.salary)
      if (form.dob) payload.dob = new Date(form.dob)
      // Documents: include only provided URLs
      const docs = Object.fromEntries(
        Object.entries(form.documents).filter(([, v]) => v && String(v).trim() !== '')
      )
      if (Object.keys(docs).length > 0) payload.documents = docs
      const res = await axios.post(`${base_url}/add-employee`, payload, { withCredentials: true })
      if (res.status === 201 || res.status === 200) {
        setMessage('Employee added successfully.')
        setTimeout(() => navigate('/dashboard/view-employees'), 800)
      }
    } catch (err) {
      console.error(err)
      setMessage(err.response?.data?.message || 'Failed to add employee')
    } finally {
      setSaving(false)
    }
  }

  return (
  <div className="p-3 md:p-4 w-full">
      <div className="mx-auto w-full max-w-none">
        {/* Header */}
        <div className="flex flex-col gap-6 rounded-xl border bg-white p-6 md:flex-row md:items-center">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20">
              <AvatarImage src={form.picture} alt={"https://avatar.iran.liara.run/public"} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="text-2xl font-bold">Add New Employee</div>
              <div className="text-sm text-slate-600">Upload profile and enter details below</div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
          {/* Left column - Personal */}
          <Card className="lg:col-span-2">
            <CardContent className="grid gap-5 p-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={form.name} onChange={onChange}  />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input id="role" name="role" value={form.role} onChange={onChange} placeholder="e.g. HR Manager" />
              </div>
              <div>
                <Label htmlFor="CID">CID</Label>
                <Input id="CID" name="CID" value={form.CID} onChange={onChange} />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Input id="gender" name="gender" value={form.gender} onChange={onChange} placeholder="Male / Female / Other" />
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                  <Input className="pl-8" id="dob" name="dob" type="date" value={form.dob} onChange={onChange} />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={form.email} onChange={onChange} />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={onChange} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={form.address} onChange={onChange} />
              </div>
              <div>
                <Label htmlFor="salary">Salary (INR)</Label>
                <div className="relative">
                  <IndianRupee className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                  <Input id="salary" name="salary" type="number" className="pl-8" value={form.salary} onChange={onChange} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right column - Profile Image */}
          <Card>
            <CardContent className="p-6 space-y-3">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={form.picture} alt={form.name} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <Upload className="h-4 w-4" /> Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files?.[0], 'picture')}
                  />
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Documents - full width */}
          <Card className="lg:col-span-3">
            <CardContent className="p-6 space-y-4">
              <div className="text-sm font-medium text-slate-900">Documents</div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Label>Aadhaar Card</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <Input placeholder="URL" value={form.documents.aadharCard}
                           onChange={(e) => onDocChange('aadharCard', e.target.value)} />
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer whitespace-nowrap">
                      <Upload className="h-4 w-4" />
                      <input type="file" accept="application/pdf,image/*" className="hidden"
                             onChange={(e) => handleUpload(e.target.files?.[0], 'aadharCard')} />
                    </label>
                  </div>
                </div>
                <div>
                  <Label>PAN Card</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <Input placeholder="URL" value={form.documents.panCard}
                           onChange={(e) => onDocChange('panCard', e.target.value)} />
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer whitespace-nowrap">
                      <Upload className="h-4 w-4" />
                      <input type="file" accept="application/pdf,image/*" className="hidden"
                             onChange={(e) => handleUpload(e.target.files?.[0], 'panCard')} />
                    </label>
                  </div>
                </div>
                <div>
                  <Label>Driving License</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <Input placeholder="URL" value={form.documents.drivingLicense}
                           onChange={(e) => onDocChange('drivingLicense', e.target.value)} />
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer whitespace-nowrap">
                      <Upload className="h-4 w-4" />
                      <input type="file" accept="application/pdf,image/*" className="hidden"
                             onChange={(e) => handleUpload(e.target.files?.[0], 'drivingLicense')} />
                    </label>
                  </div>
                </div>
                <div>
                  <Label>Resume</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <Input placeholder="URL" value={form.documents.resume}
                           onChange={(e) => onDocChange('resume', e.target.value)} />
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer whitespace-nowrap">
                      <Upload className="h-4 w-4" />
                      <input type="file" accept="application/pdf,image/*" className="hidden"
                             onChange={(e) => handleUpload(e.target.files?.[0], 'resume')} />
                    </label>
                  </div>
                </div>
              </div>

              <Separator className="my-2" />
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                  Save Employee
                </Button>
                {message && <div className="text-sm text-slate-600">{message}</div>}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}

export default AddEmployee