import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { Loader2, Leaf } from 'lucide-react'

/**
 * OAuthCallback — handles the redirect from Google OAuth on the server.
 * The server redirects to: /auth/callback?token=...&user=...
 * We grab those, persist them, and redirect the user to their dashboard.
 */
const OAuthCallback = () => {
  const navigate = useNavigate()
  const { checkAuth } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const userRaw = params.get('user')
    const error = params.get('error')

    if (error) {
      toast.error('Google sign-in failed. Please try again.')
      navigate('/login', { replace: true })
      return
    }

    if (!token || !userRaw) {
      toast.error('Invalid authentication response.')
      navigate('/login', { replace: true })
      return
    }

    try {
      const user = JSON.parse(userRaw)
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      toast.success(`Welcome, ${user.fullName}! 🌾`, {
        description: `Signed in as ${user.userType}`,
      })

      // Role-based redirect
      const redirectMap = {
        farmer: '/farmer/dashboard',
        admin: '/admin/dashboard',
        buyer: '/products',
      }

      navigate(redirectMap[user.userType] || '/', { replace: true })
    } catch {
      toast.error('Failed to process sign-in. Please try again.')
      navigate('/login', { replace: true })
    }
  }, [navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-4">
      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
        <Leaf className="w-9 h-9 text-white" />
      </div>
      <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      <p className="text-gray-400 text-sm">Completing sign-in…</p>
    </div>
  )
}

export default OAuthCallback
