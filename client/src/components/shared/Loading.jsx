import { motion } from 'framer-motion'
import { Leaf } from 'lucide-react'

const Loading = ({ fullScreen = true, size = 'default' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-12 h-12',
    large: 'w-16 h-16',
  }

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className={`${sizeClasses[size]} bg-gradient-to-br from-farmer-500 to-farmer-700 rounded-xl flex items-center justify-center`}
      >
        <Leaf className="w-1/2 h-1/2 text-white" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-farmer-600 font-medium"
      >
        Loading...
      </motion.div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return content
}

export default Loading