import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material'
import api from '../api'
import { useAuth } from '../context/AuthContext'

export default function StudentProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: me, fetchProfile } = useAuth()

  const [student, setStudent] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  const [editing, setEditing] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [form, setForm] = React.useState({ name: '', phone: '', year: '', section: '', batch: '' })

  React.useEffect(() => {
    load()
  }, [id])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/admin/users/${id}`)
      setStudent(res.data.user)
      setForm({
        name: res.data.user.name || '',
        phone: res.data.user.phone || '',
        year: res.data.user.year || '',
        section: res.data.user.section || '',
        batch: res.data.user.batch || ''
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user')
    } finally {
      setLoading(false)
    }
  }

  function canEditOrDelete() {
    if (!me) return false
    if (me.role === 'faculty') return student && student.role === 'student' && me.department && me.department === student.department
    if (me.role === 'hod') return student && me.department && me.department === student.department
    if (me.role === 'admin') return true
    return false
  }

  async function handleSave() {
    setSaving(true)
    try {
      const updates = { name: form.name, phone: form.phone, year: form.year, section: form.section, batch: form.batch }
      await api.put(`/admin/users/${id}`, updates)
      await load()
      setEditing(false)
      // refresh profile if current user edited themselves
      if (me && String(me._id) === String(id)) await fetchProfile()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this student? This cannot be undone.')) return
    setDeleting(true)
    try {
      await api.delete(`/admin/users/${id}`)
      navigate('/faculty-students')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return (
    <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  )

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Student Profile</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!student ? (
        <Typography>No user found</Typography>
      ) : (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Name</Typography>
                <Typography variant="h6">{student.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Email</Typography>
                <Typography variant="body2">{student.email}</Typography>
              </Box>

              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" color="text.secondary">Role</Typography>
                <Chip label={(student.role || 'N/A').toUpperCase()} size="small" />
                <Box sx={{ mt: 2 }}>
                  {canEditOrDelete() && (
                    <>
                      <Button variant="outlined" sx={{ mr: 1 }} onClick={() => setEditing(true)}>Edit</Button>
                      <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</Button>
                    </>
                  )}
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Department</Typography>
                <Typography variant="h6">{student.department || 'N/A'}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">Year</Typography>
                <Typography variant="h6">{student.role === 'student' ? (student.year || 'N/A') : 'N/A'}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">Section</Typography>
                <Typography variant="h6">{student.role === 'student' ? (student.section || 'N/A') : 'N/A'}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">Phone</Typography>
                <Typography variant="h6">{student.phone || 'N/A'}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">Academic Batch</Typography>
                <Typography variant="h6">{student.batch || 'N/A'}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      <Dialog open={editing} onClose={() => setEditing(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Student</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'grid', gap: 2 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth />
            <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} fullWidth />
            <TextField label="Year" select value={String(form.year || '')} onChange={(e) => setForm({ ...form, year: e.target.value })} fullWidth>
              <MenuItem value="">(unset)</MenuItem>
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
              <MenuItem value={3}>3</MenuItem>
              <MenuItem value={4}>4</MenuItem>
            </TextField>
            <TextField label="Section" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} fullWidth />
            <TextField label="Batch" value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
