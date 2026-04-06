import { useState, useEffect } from 'react'
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

  const getIcon = (type) => {
    switch (type) {
      case 'order': return <Package className="w-5 h-5 text-blue-500" />
      case 'payment': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'alert': return <AlertCircle className="w-5 h-5 text-red-500" />
      default: return <Bell className="w-5 h-5 text-muted-foreground" />
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
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated with your marketplace activity</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMarkAllRead}
            disabled={!notifications.some(n => !n.isRead)}
            className="rounded-full"
          >
            <Check className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden rounded-2xl">
        <CardHeader className="bg-muted/50 border-b p-4">
          <Tabs defaultValue="all" onValueChange={setFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-farmer-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="divide-y divide-border/50">
              <AnimatePresence mode="popLayout">
                {filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification._id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-6 flex items-start gap-4 transition-colors group ${!notification.isRead ? 'bg-farmer-50/20' : ''}`}
                  >
                    <div className={`p-3 rounded-xl flex-shrink-0 ${!notification.isRead ? 'bg-card shadow-sm ring-1 ring-border' : 'bg-muted/50'}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className={`font-bold text-lg truncate ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.isRead && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="h-8 w-8 text-farmer-600 hover:text-farmer-700 hover:bg-farmer-50"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(notification._id)}
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className={`text-muted-foreground leading-relaxed mb-3 ${!notification.isRead ? 'font-medium text-foreground/90' : ''}`}>
                        {notification.content}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        {notification.link && (
                          <Button 
                            variant="link" 
                            onClick={() => (window.location.href = notification.link)}
                            className="p-0 h-auto text-xs font-bold text-farmer-600"
                          >
                            View Details
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
