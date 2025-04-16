import { useNavigate } from 'react-router-dom'
import { Book, Bell, User, Search } from 'lucide-react'

const TopNavigation = ({ title }) => {
  const navigate = useNavigate()

  return (
    <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Book className="h-6 w-6" />
        <span className="text-xl font-bold">BookLovers</span>
        {title && <span className="mx-2">|</span>}
        {title && <span className="text-lg">{title}</span>}
      </div>
      <div className="flex items-center space-x-4">
        <Search className="h-5 w-5 cursor-pointer" onClick={() => navigate('/explore')} />
        <Bell className="h-5 w-5 cursor-pointer" />
        <div 
          className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center cursor-pointer"
          onClick={() => navigate('/profile')}
        >
          <User className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}

export default TopNavigation
