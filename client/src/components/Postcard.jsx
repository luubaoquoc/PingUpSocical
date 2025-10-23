import { BadgeCheck, Heart, MessageCircle, Share2 } from 'lucide-react'
import React, { useState } from 'react'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const Postcard = ({ post }) => {

  const navigate = useNavigate()

  const postWithHahshTags = post.content.replace(/#(\w+)/g, '<span class="text-indigo-600 cursor-pointer">#$1</span>')
  const currentUser = useSelector((state) => state.user.value);
  const [likes, setLikes] = useState(post?.like_count || [])

  const { getToken } = useAuth()


  const handleLike = async () => {
    try {
      const token = await getToken()
      const { data } = await api.post('/api/post/like', { postId: post._id }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (data.success) {
        toast.success(data.message)
        setLikes(prev => {
          if (prev.includes(currentUser._id)) {
            return prev.filter(id => id !== currentUser._id)
          } else {
            return [...prev, currentUser._id]
          }
        }
        )
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className='bg-white rounded-xl shadow p-4 space-y-4 max-w-2xl md:min-w-2xl'>
      {/* User info */}
      <div className='inline-flex items-center gap-3 cursor-pointer'>
        <img src={post.user.profile_picture} alt="" className='size-10 rounded-full shadow' />
        <div >
          <div onClick={() => navigate(`/profile/${post.user._id}`)}
            className='flex items-center space-x-1'>
            <span>{post.user.full_name}</span>
            <BadgeCheck className='size-4 text-blue-500' />
          </div>
          <div className='text-gray-500 text-sm'>@{post.user.username} - {moment(post.createdAt).fromNow()}</div>
        </div>
      </div>
      {/* content */}
      {post.content && <div
        className='text-gray-800 text-sm whitespace-pre-line '
        dangerouslySetInnerHTML={{ __html: postWithHahshTags }}
      />
      }

      {/* image */}
      <div className='grid grid-cols-2 gap-2'>
        {post.image_urls.map((img, index) => (
          <img key={index} src={img} alt="" className={`w-full max-h-96 object-cover 
        rounded-lg ${post.image_urls.length === 1 && 'col-span-2 h-auto'}`} />
        ))}
      </div>

      {/* Action */}
      <div className='flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300'>
        <div className='flex items-center gap-1'>
          <Heart className={`size-4 cursor-pointer ${(likes && likes.includes(currentUser._id)) && 'text-red-500 fill-red-500'}`}
            onClick={handleLike} />
          <span>{likes ? likes.length : 0}</span>
        </div>
        <div className='flex items-center gap-1'>
          <MessageCircle className={`size-4 cursor-pointer `}
            onClick={handleLike} />
          <span>{12}</span>
        </div>
        <div className='flex items-center gap-1'>
          <Share2 className={`size-4 cursor-pointer `}
            onClick={handleLike} />
          <span>{7}</span>
        </div>
      </div>
    </div>
  )
}

export default Postcard
