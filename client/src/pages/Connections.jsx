import React, { useState } from 'react'
import {
  dummyConnectionsData as connections,
  dummyFollowersData as followers,
  dummyFollowingData as following,
  dummyPendingConnectionsData as pendingConnections
} from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, UserCheck, UserPlus, UserRoundPen, Users } from 'lucide-react'

const Connections = () => {

  const navigate = useNavigate()
  const [currentTab, setCurrentTab] = useState('Followers')

  const dataArray = [
    { label: 'Followers', value: followers, icon: Users },
    { label: 'Following', value: following, icon: UserCheck },
    { label: 'Connections', value: connections, icon: UserRoundPen },
    { label: 'Pending', value: pendingConnections, icon: UserPlus },
  ]
  return (
    <div className='min-h-screen relative bg-slate-50'>
      <div className='max-w-6xl mx-auto p-6'>
        {/* Title */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Connections</h1>
          <p className='text-slate-600'>Manage your network new connections</p>
        </div>

        {/* Counts */}
        <div className='flex flex-wrap mb-8 gap-6'>
          {
            dataArray.map((item, index) => (
              <div key={index} className='flex flex-col items-center justify-center gap-1 border
              h-20 w-40 border-gray-200 bg-white shadow rounded-md'>
                <b>{item.value.length}</b>
                <p className='text-slate-600'>{item.label}</p>
              </div>
            ))
          }
        </div>

        {/* Tabs */}
        <div className='inline-flex flex-wrap items-center border border-gray-200 rounded-md
        p-1 bg-white shadow-sm'>
          {dataArray.map((tab, index) => (
            <button key={index} onClick={() => setCurrentTab(tab.label)}
              className={`flex items-center px-3 py-1 text-sm rounded-md transition-colors cursor-pointer
          ${currentTab === tab.label ? 'bg-white font-medium text-black' : 'text-gray-500 hover:text-black'}`}>
              <tab.icon className='size-4' />
              <span className='ml-1'>{tab.label}</span>
              {tab.count !== undefined && (
                <span className='ml-2 text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-0.5'>
                  {tab.count}
                </span>
              )}
            </button>
          ))
          }
        </div>

        {/* Connections */}
        <div className='flex flex-wrap gap-6 mt-6'>
          {dataArray.find((item) => item.label === currentTab)?.value.map((user, index) => (
            <div key={index} className='w-full max-w-88 flex gap-5 p-6 bg-white shadow rounded-md'>
              <img src={user.profile_picture} alt="" className='size-12 rounded-full shadow-md mx-auto' />
              <div className='flex-1'>
                <p className='text-slate-700 font-medium'>{user.full_name}</p>
                <p className='text-slate-500'>@{user.username}</p>
                <p className='text-slate-600'>{user.bio.slice(0, 30)}...</p>
                <div className='flex max-sm:flex-col gap-2 mt-4'>
                  {
                    <button onClick={() => navigate(`/profile/${user._id}`)}
                      className='w-full p-2 text-sm rounded bg-gradient-to-r from-indigo-500
                    to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 transition text-white cursor-pointer'>
                      View Profile
                    </button>
                  }
                  {
                    currentTab === 'Following' && (
                      <button className='w-full p-2 text-sm rounded  bg-slate-100 text-black
                    hover:bg-slate-200 active:scale-95 transition cursor-pointer'>
                        Unfollow
                      </button>
                    )
                  }
                  {
                    currentTab === 'Pending' && (
                      <button className='w-full p-2 text-sm rounded  bg-slate-100 text-black
                    hover:bg-slate-200 active:scale-95 transition cursor-pointer'>
                        Accept
                      </button>
                    )
                  }
                  {
                    currentTab === 'Connections' && (
                      <button onClick={() => navigate(`/messages/${user._id}`)}
                        className='w-full p-2 text-sm rounded  bg-slate-100 text-black
                    hover:bg-slate-200 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1'>
                        <MessageSquare className='size-4' />
                        Message
                      </button>
                    )
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Connections
