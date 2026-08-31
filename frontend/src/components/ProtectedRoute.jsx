import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loading from './Loading'
import { getJwtPayload } from '../utils/authToken'

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()

  if (loading) return <Loading />
  if (!user) return <Navigate to="/" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />

  if (role === 'municipal_admin') {
    const adminToken =
      localStorage.getItem('adminToken') || localStorage.getItem('token')
    const tokenRole = getJwtPayload(adminToken)?.role

    if (tokenRole !== 'municipal_admin') {
      return <Navigate to="/admin/login" replace />
    }
  }

  return children
}
