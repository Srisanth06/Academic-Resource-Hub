import React from 'react'
import { Link } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ListItemButton,
  ListItemText
} from '@mui/material'
import AssignmentIcon from '@mui/icons-material/Assignment'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import PeopleIcon from '@mui/icons-material/People'
import SchoolIcon from '@mui/icons-material/School'
import api from '../api'

export default function FacultyDashboard() {
  const [dept, setDept] = React.useState(null)
  const [assignments, setAssignments] = React.useState([])
  const [students, setStudents] = React.useState([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const profile = await api.get('/auth/profile')
      setDept(profile.data.user.department)

      const [assignRes, studentRes] = await Promise.all([
        api.get('/assignments'),
        api.get(`/admin/users?department=${profile.data.user.department}&role=student`)
      ])

      setAssignments(assignRes.data.assignments || [])
      setStudents(studentRes.data.users || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function deleteAssignment(id) {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return
    try {
      await api.delete(`/assignments/${id}`)
      await load()
    } catch (err) {
      console.error(err)
    }
  }

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <Card sx={{ background: `linear-gradient(135deg, ${color}18, ${color}08)`, border: `1px solid ${color}33` }}>
      <CardContent sx={{ textAlign: 'center' }}>
        <Icon sx={{ fontSize: 40, color, mb: 1 }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold', color }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </CardContent>
    </Card>
  )

  return (
    <Box sx={{ display: 'flex', gap: 3, p: 3 }}>
      <Card sx={{ width: 260, flexShrink: 0 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Faculty Menu</Typography>
          <List>
            <ListItemButton component={Link} to="/assignments">
              <ListItemText primary="Assignments" />
            </ListItemButton>
            <ListItemButton component={Link} to="/upload-materials">
              <ListItemText primary="Upload Materials" />
            </ListItemButton>
            <ListItemButton component={Link} to="/notifications">
              <ListItemText primary="Class Notices" />
            </ListItemButton>
            <ListItemButton component={Link} to="/faculty-verification">
              <ListItemText primary="Teaching Mode" />
            </ListItemButton>
          </List>
        </CardContent>
      </Card>

      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Faculty Dashboard — {dept || '—'}</Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            mb: 3,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))'
            }
          }}
        >
          <StatCard icon={AssignmentIcon} label="Assignments" value={assignments.length} color="#e74c3c" />
          <StatCard icon={PeopleIcon} label="Students" value={students.length} color="#2980b9" />
          <StatCard icon={SchoolIcon} label="Department" value={dept ? '1' : '0'} color="#16a085" />
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h6">Students moved to dedicated page</Typography>
              <Typography variant="body2" color="text.secondary">
                Use the Students page to view year-wise student lists.
              </Typography>
            </Box>
            <Button component={Link} to="/faculty-students" variant="outlined" startIcon={<PeopleIcon />}>
              Open Students List
            </Button>
          </CardContent>
        </Card>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AssignmentIcon color="primary" />
                <Typography variant="h6">Recent Assignments</Typography>
              </Box>
              {assignments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No assignments found</Typography>
              ) : (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {assignments.map((a) => (
                        <TableRow key={a._id}>
                          <TableCell>{a.title}</TableCell>
                          <TableCell>{a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>{a.submissions?.length || 0} submitted</TableCell>
                          <TableCell align="center">
                            <Button size="small" startIcon={<EditIcon />} sx={{ mr: 1 }}>Edit</Button>
                            <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => deleteAssignment(a._id)}>Delete</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  )
}
