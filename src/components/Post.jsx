import { useState } from 'react'
import { ThumbsUp, MessageSquare, Share2, Book, MapPin, User, Calendar } from 'lucide-react'

const Post = ({ post }) => {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(post.likes)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  
  const [comments, setComments] = useState([
    {
      id: 1,
      user: {
        name: 'Alex Thompson',
        avatar: 'bg-indigo-300'
      },
      content: 'I absolutely loved this book too! That plot twist was incredible.',
      timestamp: '1 hour ago'
    },
    {
      id: 2,
      user: {
        name: 'Olivia Parker',
        avatar: 'bg-teal-300'
      },
      content: 'Its on my reading list for next month. Even more excited to pick it up now!',
      timestamp: '45 minutes ago'
    }
  ])

  const handleLike = () => {
    if (liked) {
      setLikes(likes - 1)
    } else {
      setLikes(likes + 1)
    }
    setLiked(!liked)
  }

  const handleComment = (e) => {
    e.preventDefault()
    if (commentText.trim()) {
      setComments([...comments, {
        id: Date.now(),
        user: {
          name: 'You',
          avatar: 'bg-indigo-300'
        },
        content: commentText,
        timestamp: 'Just now'
      }])
      setCommentText('')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Post Header */}
      <div className="p-4 border-b">
        <div className="flex items-center">
          <div className={`w-10 h-10 ${post.user.avatar} rounded-full flex-shrink-0 flex items-center justify-center`}>
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="ml-3">
            <div className="font-semibold">{post.user.name}</div>
            <div className="text-xs text-gray-500 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {post.user.location} • {post.timestamp}
            </div>
          </div>
        </div>
      </div>
      
      {/* Post Content */}
      <div className="p-4">
        <p className="text-sm mb-4">{post.content}</p>
        
        {/* Book Card (if this post is about a book) */}
        {post.book && (
          <div className="bg-gray-50 p-3 rounded-lg flex items-center mb-3">
            <div className={`${post.book.cover} w-12 h-16 rounded flex-shrink-0`}></div>
            <div className="ml-3">
              <div className="font-semibold text-sm flex items-center">
                <Book className="h-3 w-3 mr-1 text-gray-500" />
                {post.book.title}
              </div>
              <div className="text-xs text-gray-500">{post.book.author}</div>
            </div>
          </div>
        )}
        
        {/* Event Card (if this post is about an event) */}
        {post.event && (
          <div className="bg-gray-50 p-3 rounded-lg flex items-center mb-3">
            <div className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-center mr-3 flex-shrink-0">
              <Calendar className="h-4 w-4 mx-auto mb-1" />
              <div className="text-xs font-bold">EVENT</div>
            </div>
            <div>
              <div className="font-semibold text-sm">{post.event.name}</div>
              <div className="text-xs text-gray-500">{post.event.date} • {post.event.location}</div>
            </div>
          </div>
        )}
        
        {/* Post Stats */}
        <div className="flex justify-between text-xs text-gray-500 mt-3">
          <div>{likes} likes</div>
          <div>{post.comments} comments</div>
        </div>
      </div>
      
      {/* Post Actions */}
      <div className="border-t border-b flex">
        <button 
          className={`flex-1 py-2 flex items-center justify-center text-sm ${liked ? 'text-indigo-600' : 'text-gray-500'}`}
          onClick={handleLike}
        >
          <ThumbsUp className="h-4 w-4 mr-2" />
          Like
        </button>
        <button 
          className="flex-1 py-2 flex items-center justify-center text-sm text-gray-500"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Comment
        </button>
        <button className="flex-1 py-2 flex items-center justify-center text-sm text-gray-500">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </button>
      </div>
      
      {/* Comments Section */}
      {showComments && (
        <div className="p-4">
          <form onSubmit={handleComment} className="flex items-center mb-4">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-indigo-600" />
            </div>
            <input
              type="text"
              className="ml-3 flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
          </form>
          
          <div className="space-y-3">
            {comments.map(comment => (
              <div key={comment.id} className="flex">
                <div className={`w-8 h-8 ${comment.user.avatar} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="ml-3 flex-1">
                  <div className="bg-gray-100 rounded-2xl px-3 py-2">
                    <div className="font-semibold text-xs">{comment.user.name}</div>
                    <div className="text-sm">{comment.content}</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {comment.timestamp} • Like • Reply
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Post
