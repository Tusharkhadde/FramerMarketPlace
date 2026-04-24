import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { io } from 'socket.io-client'
import { 
  Send, 
  Mic, 
  Square,
  Image as ImageIcon,
  MoreVertical,
  Check,
  CheckCheck,
  MessageSquare,
  Search,
  User,
  ArrowLeft,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { useAuth } from '@/context/AuthContext'
import api from '@/config/api'

const QUICK_REPLIES = [
  "Is this available?",
  "Can you deliver tomorrow?",
  "What is the minimum order quantity?",
  "I'd like to negotiate the price."
]

const Messages = () => {
  const { user } = useAuth()
  const [rooms, setRooms] = useState([])
  const [activeRoom, setActiveRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  
  const messagesEndRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerIntervalRef = useRef(null)

  // Initialize Socket and Fetch Rooms
  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true,
    })

    socketInstance.on('connect', () => {
      socketInstance.emit('join', user._id)
    })

    socketInstance.on('receive-message', (data) => {
      // data: { message, roomId }
      if (activeRoom && activeRoom._id === data.roomId) {
        setMessages(prev => [...prev, data.message])
        scrollToBottom()
      }
      // Also update the room's last message in the sidebar
      setRooms(prevRooms => prevRooms.map(room => {
        if (room._id === data.roomId) {
          return { ...room, lastMessage: data.message, updatedAt: new Date() }
        }
        return room
      }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)))
    })

    setSocket(socketInstance)
    fetchRooms()

    return () => {
      socketInstance.disconnect()
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [user])

  // Fetch messages when a room is selected
  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom._id)
    }
  }, [activeRoom])

  const fetchRooms = async () => {
    try {
      const response = await api.get('/chat/rooms')
      setRooms(response.data.data.rooms)
    } catch (error) {
      toast.error('Failed to load chats')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (roomId) => {
    try {
      const response = await api.get(`/chat/rooms/${roomId}/messages`)
      setMessages(response.data.data.messages)
      setTimeout(scrollToBottom, 100) // allow render
    } catch (error) {
      toast.error('Failed to load messages')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e, quickText = null) => {
    if (e) e.preventDefault()
    
    const content = quickText || newMessage.trim()
    if (!content && !isRecording) return

    try {
      // Optimistic update
      const tempMessage = {
        _id: Date.now().toString(),
        sender: user,
        content: content,
        messageType: 'text',
        createdAt: new Date().toISOString(),
      }
      setMessages(prev => [...prev, tempMessage])
      setNewMessage('')
      setTimeout(scrollToBottom, 50)

      const response = await api.post(`/chat/rooms/${activeRoom._id}/messages`, {
        content: content,
        messageType: 'text'
      })

      const savedMessage = response.data.data.message
      const recipient = activeRoom.participants.find(p => p._id !== user._id)

      // Emit to socket
      socket.emit('send-message', {
        recipientId: recipient._id,
        roomId: activeRoom._id,
        message: savedMessage
      })

      // Update actual message ID (simple replace)
      setMessages(prev => prev.map(m => m._id === tempMessage._id ? savedMessage : m))
      
      // Update sidebar
      setRooms(prevRooms => prevRooms.map(room => {
        if (room._id === activeRoom._id) {
          return { ...room, lastMessage: savedMessage, updatedAt: new Date() }
        }
        return room
      }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)))

    } catch (error) {
      toast.error('Failed to send message')
      // Remove optimistic message on fail
      setMessages(prev => prev.filter(m => m.content !== content))
    }
  }

  // Audio Recording Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await uploadAndSendAudio(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      toast.error('Microphone access denied or unavailable.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      clearInterval(timerIntervalRef.current)
    }
  }

  const uploadAndSendAudio = async (audioBlob) => {
    // In a real production app, we would upload the audioBlob to Cloudinary directly.
    // Since this is a demo, we will use a mock Cloudinary URL and simulate sending an audio message.
    const reader = new FileReader()
    reader.readAsDataURL(audioBlob)
    reader.onloadend = async () => {
      const base64AudioMessage = reader.result
      
      try {
        const response = await api.post(`/chat/rooms/${activeRoom._id}/messages`, {
          messageType: 'voice',
          voiceUrl: base64AudioMessage // Using base64 for demo purposes
        })

        const savedMessage = response.data.data.message
        const recipient = activeRoom.participants.find(p => p._id !== user._id)

        socket.emit('send-message', {
          recipientId: recipient._id,
          roomId: activeRoom._id,
          message: savedMessage
        })

        setMessages(prev => [...prev, savedMessage])
        scrollToBottom()
      } catch (error) {
        toast.error('Failed to send voice note')
      }
    }
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const getRecipient = (room) => {
    return room.participants.find(p => p._id !== user._id) || room.participants[0]
  }

  if (loading) {
    return <div className="h-[calc(100vh-64px)] flex items-center justify-center">Loading chats...</div>
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background overflow-hidden border-t">
      
      {/* Sidebar: Chat List */}
      <div className={`w-full md:w-[350px] lg:w-[400px] flex flex-col border-r border-border/50 bg-card/30 ${activeRoom ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border/50">
          <h2 className="text-2xl font-black text-foreground mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-9 bg-muted/50 rounded-full border-border/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
              <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium">No conversations yet</p>
              <p className="text-sm mt-1">Start chatting with farmers from the marketplace.</p>
            </div>
          ) : (
            rooms.map((room) => {
              const recipient = getRecipient(room)
              const isActive = activeRoom?._id === room._id
              return (
                <div 
                  key={room._id}
                  onClick={() => setActiveRoom(room)}
                  className={`p-4 border-b border-border/20 cursor-pointer transition-colors flex gap-3 items-center ${isActive ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-muted/30'}`}
                >
                  <Avatar className="w-12 h-12 border border-border/50">
                    <AvatarImage src={recipient.avatar?.url} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {recipient.fullName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="font-bold text-foreground truncate">{recipient.fullName}</h3>
                      {room.lastMessage && (
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                          {format(new Date(room.lastMessage.createdAt), 'h:mm a')}
                        </span>
                      )}
                    </div>
                    {room.product && (
                      <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-1 truncate">
                        Re: {room.product.cropName}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground truncate">
                      {room.lastMessage 
                        ? (room.lastMessage.messageType === 'voice' ? '🎤 Voice Note' : room.lastMessage.content) 
                        : 'Start a conversation'}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-[#f8fafc] dark:bg-background relative ${!activeRoom ? 'hidden md:flex' : 'flex'}`}>
        {!activeRoom ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Your Messages</h2>
            <p>Select a conversation from the sidebar to start chatting.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-16 px-4 border-b border-border/50 bg-background/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setActiveRoom(null)}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Avatar className="w-10 h-10 border border-border/50">
                  <AvatarImage src={getRecipient(activeRoom).avatar?.url} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {getRecipient(activeRoom).fullName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-foreground leading-tight">{getRecipient(activeRoom).fullName}</h3>
                  <p className="text-[11px] text-muted-foreground capitalize">{getRecipient(activeRoom).userType}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
              {messages.map((msg, idx) => {
                const isMe = msg.sender._id === user._id || msg.sender === user._id
                const showAvatar = !isMe && (idx === 0 || messages[idx - 1].sender._id !== msg.sender._id)
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg._id} 
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}
                  >
                    {!isMe && (
                      <div className="w-8 flex-shrink-0 mr-2">
                        {showAvatar && (
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={msg.sender.avatar?.url} />
                            <AvatarFallback className="text-[10px]">{msg.sender.fullName?.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    )}
                    
                    <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div 
                        className={`px-4 py-2.5 rounded-2xl shadow-sm relative group ${
                          isMe 
                            ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                            : 'bg-card border border-border/50 text-foreground rounded-tl-sm'
                        }`}
                      >
                        {msg.messageType === 'voice' ? (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-background/20 flex items-center justify-center">
                              <Mic className="w-4 h-4" />
                            </div>
                            <audio controls src={msg.voiceUrl} className="h-8 max-w-[200px]" />
                          </div>
                        ) : (
                          <p className="text-[15px] leading-relaxed break-words">{msg.content}</p>
                        )}
                      </div>
                      <div className={`text-[10px] text-muted-foreground mt-1 flex items-center gap-1 ${isMe ? 'self-end' : 'self-start'}`}>
                        {format(new Date(msg.createdAt), 'h:mm a')}
                        {isMe && (
                          msg.isRead ? <CheckCheck className="w-3 h-3 text-blue-500" /> : <Check className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {user.userType === 'buyer' && messages.length < 5 && (
              <div className="px-4 py-2 bg-background border-t border-border/30 flex overflow-x-auto gap-2 custom-scrollbar no-scrollbar py-3">
                {QUICK_REPLIES.map((reply, i) => (
                  <button
                    key={i}
                    onClick={(e) => handleSendMessage(e, reply)}
                    className="whitespace-nowrap px-4 py-1.5 bg-primary/5 text-primary border border-primary/20 hover:bg-primary/10 rounded-full text-xs font-semibold transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-background border-t border-border/50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
              {isRecording ? (
                <div className="flex items-center gap-4 bg-rose-500/10 border border-rose-500/20 p-2 rounded-2xl animate-pulse">
                  <div className="w-3 h-3 bg-rose-500 rounded-full ml-4 animate-ping" />
                  <span className="text-rose-500 font-bold font-mono text-lg flex-1">
                    {formatTime(recordingTime)}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => { stopRecording(); setIsRecording(false) }} className="text-muted-foreground hover:text-foreground">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                  <Button onClick={stopRecording} className="bg-rose-500 hover:bg-rose-600 rounded-full shadow-lg shadow-rose-500/30">
                    <Square className="w-4 h-4 mr-2" /> Stop & Send
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                  <div className="flex-1 bg-muted/30 border border-border/50 rounded-2xl flex items-end p-1 transition-colors focus-within:border-primary/50 focus-within:bg-background">
                    <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground shrink-0 rounded-xl hover:bg-muted">
                      <ImageIcon className="w-5 h-5" />
                    </Button>
                    <textarea 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 max-h-32 min-h-[40px] bg-transparent border-0 focus:ring-0 resize-none py-2.5 px-2 text-[15px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  
                  {newMessage.trim() ? (
                    <Button type="submit" size="icon" className="h-12 w-12 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 shrink-0">
                      <Send className="w-5 h-5" />
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      size="icon" 
                      onClick={startRecording}
                      className="h-12 w-12 rounded-2xl bg-muted text-foreground hover:bg-muted/80 shrink-0"
                    >
                      <Mic className="w-5 h-5" />
                    </Button>
                  )}
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Messages
