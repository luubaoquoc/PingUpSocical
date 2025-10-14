import React from 'react'
import { dummyUserData } from '../assets/assets'
import { MapPinIcon, MessageCircle, Plus, UserPlus } from 'lucide-react'

const UserCard = ({ user }) => {
  const currentUser = dummyUserData

  const handleFollow = async () => {
    // Follow user logic
  }

  const handleConnectionsRequest = async () => {
    // Send connection request logic
  }
  return (
    <div key={user._id} className='p-4 pt-6 flex flex-col justify-between w-72 shadow border border-gray-300
    rounded-md'>
      <div className='text-center'>
        <img src={user.profile_picture} alt="" className='size-16 rounded-full shadow-md mx-auto' />
        <p className='mt-4 font-semibold'>{user.full_name}</p>
        {user.username && <p className='text-gray-500 font-light'>@{user.username}</p>}
        {user.bio && <p className='text-gray-600 mt-2 text-center text-sm px-4'>{user.bio}</p>}
      </div>

      <div className='flex items-center justify-center gap-2 mt-4 text-xs text-gray-700'>
        <div className='flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1'>
          <MapPinIcon className='size-4' /> {user.location}
        </div>
        <div className='flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1'>
          <span>{user.followers.length}</span> Followers
        </div>
      </div>

      <div className='flex mt-4 gap-2'>
        <button onClick={handleFollow} disabled={currentUser?.following.includes(user._id)}
          className='w-full py-2 rounded-md flex justify-center items-center gap-2 bg-gradient-to-r
         from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
        cursor-pointer active:scale-95 transition text-white '>
          <UserPlus className='size-4' /> {currentUser?.following.includes(user._id) ? 'Following' : 'Follow'}
        </button>
        <button onClick={handleConnectionsRequest}
          className='flex justify-center items-center w-16 border text-slate-500 group rounded-md
        cursor-pointer active:scale-95 transition'>
          {currentUser?.connections.includes(user._id) ?
            <MessageCircle className='size-5 group-hover:scale-105 transition' />
            : <Plus className='size-5 group-hover:scale-105 transition' />}
        </button>
      </div>
    </div>
  )
}

export default UserCard
