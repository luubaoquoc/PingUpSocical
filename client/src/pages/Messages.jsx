import React from 'react'
import { Eye, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const Messages = () => {

  const { connections } = useSelector((state) => state.connections);
  const navigate = useNavigate()
  return (
    <div className='min-h-screen relative bg-slate-50'>
      <div className='max-w-6xl mx-auto p-6'>
        {/* Title */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Tin nhắn</h1>
          <p className='text-slate-600'>Nói chuyện với bạn bè và gia đình của bạn</p>
        </div>

        {/* Connected Users */}
        <div className=' flex flex-col gap-3'>
          {connections.map((user) => (
            <div key={user._id} className='max-w-xl flex flex-wrap gap-5 p-6 bgwhite rounded-md shadow-md'>
              <img className='rounded-full size-12 mx-auto'
                src={user.profile_picture} alt={user.full_name} />
              <div className='flex-1'>
                <p className='text-slate-570 font-medium'>{user.full_name}</p>
                <p className='text-slate-500'>@{user.username}</p>
                <p className='text-slate-600 text-sm'>{user.bio}</p>
              </div>
              <div className='flex flex-col gap-2 mt-4'>
                <button onClick={() => navigate(`/messages/${user._id}`)}
                  className='size-10 flex items-center justify-center text-sm bg-slate-100
                rounded hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer gap-1'>
                  <MessageSquare className='size-4' />
                </button>
                <button onClick={() => navigate(`/profile/${user._id}`)}
                  className='size-10 flex items-center justify-center text-sm bg-slate-100
                rounded hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer'>
                  <Eye className='size-4' />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Messages
