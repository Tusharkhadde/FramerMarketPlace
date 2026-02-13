import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import Loading from './Loading'

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.userType)) {
    // Redirect to appropriate dashboard based on user type
    const redirectPath = 
      user?.userType === 'farmer' ? '/farmer/dashboard' :
      user?.userType === 'admin' ? '/admin/dashboard' : '/'
    
    return <Navigate to={redirectPath} replace />
  }

  return children
}

export default PrivateRoute