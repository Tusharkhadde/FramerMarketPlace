import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  CheckCircle, 
  Package, 
  AlertCircle, 
  Trash2, 
  Check,
  Search,
  Filter
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import api from '@/config/api'
import { toast } from 'sonner'

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await api.get('/notifications')
      setNotifications(response.data.data.notifications)
    } catch (error) {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    } catch (error) {
      toast.error('Failed to mark as read')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`)
      setNotifications(prev => prev.filter(n => n._id !== id))
      toast.success('Notification deleted')
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Action failed')
    }
  }

  const getIcon = (type, title) => {
    const isSuccess = title?.toLowerCase().includes('confirmed') || title?.toLowerCase().includes('delivered')
    const isWarning = title?.toLowerCase().includes('cancelled') || title?.toLowerCase().includes('alert')
    
    switch (type) {
      case 'order': 
        return <Package className={`w-5 h-5 ${isSuccess ? 'text-green-500' : isWarning ? 'text-red-500' : 'text-blue-500'}`} />
      case 'payment': 
        return <CheckCircle className="w-5 h-5 text-emerald-500" />
      case 'alert': 
        return <AlertCircle className="w-5 h-5 text-rose-500" />
      default: 
        return <Bell className="w-5 h-5 text-amber-500" />
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated with your marketplace activity</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMarkAllRead}
            disabled={!notifications.some(n => !n.isRead)}
            className="rounded-full bg-background hover:bg-muted font-bold border-border/50"
          >
            <Check className="w-4 h-4 mr-2" />
            Mark all read
          </Button>
        </div>
      </div>

      <Card className="border-border/40 shadow-xl overflow-hidden rounded-[2rem] bg-card/50 backdrop-blur-sm">
        <CardHeader className="bg-muted/30 border-b border-border/40 p-4">
          <Tabs defaultValue="all" onValueChange={setFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-[300px] bg-muted/50 rounded-full h-10 p-1">
              <TabsTrigger value="all" className="rounded-full text-xs font-bold transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">All</TabsTrigger>
              <TabsTrigger value="unread" className="rounded-full text-xs font-bold transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">Unread</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-20 text-center">
              <div className="animate-spin w-10 h-10 border-4 border-farmer-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground font-bold text-lg">Harvesting notifications...</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="divide-y divide-border/30">
              <AnimatePresence mode="popLayout">
                {filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ backgroundColor: 'rgba(var(--farmer-500-rgb), 0.05)' }}
                    className={`p-6 flex items-start gap-4 transition-all relative group ${!notification.isRead ? 'bg-farmer-500/[0.03]' : ''}`}
                  >
                    {!notification.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-farmer-500 rounded-r-full" />
                    )}
                    
                    <div className={`p-4 rounded-2xl flex-shrink-0 transition-transform group-hover:scale-110 ${
                      !notification.isRead 
                        ? 'bg-card shadow-md ring-1 ring-border shadow-farmer-500/10' 
                        : 'bg-muted/50 opacity-70'
                    }`}>
                      {getIcon(notification.type, notification.title)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1.5">
                        <h3 className={`font-black text-lg tracking-tight truncate ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          {!notification.isRead && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="h-8 w-8 rounded-full text-farmer-600 hover:text-farmer-700 hover:bg-farmer-100/50"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(notification._id)}
                            className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-100/50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className={`text-muted-foreground leading-relaxed mb-4 text-sm ${!notification.isRead ? 'font-semibold text-foreground/90' : 'opacity-60'}`}>
                        {notification.content}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-black bg-muted/80 px-2.5 py-1 rounded-full border border-border/30">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        {notification.link && (
                          <Button 
                            variant="link" 
                            onClick={() => navigate(notification.link)}
                            className="p-0 h-auto text-xs font-black text-farmer-600 hover:text-farmer-700 decoration-2 underline-offset-4"
                          >
                            VIEW DETAILS →
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                <Bell className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">Nothing to see here</h3>
              <p className="text-muted-foreground">You're all caught up! No notifications available.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default NotificationsPage
