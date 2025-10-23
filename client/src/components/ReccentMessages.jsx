import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import { useAuth, useUser } from '@clerk/clerk-react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const ReccentMessages = () => {

  const [messages, setMessages] = useState([])
  const { user } = useUser()
  const { getToken } = useAuth()

  const fetchRecentMessages = async () => {
    try {
      const token = await getToken()
      const { data } = await api.get('/api/user/recent-messages', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
      if (data.success) {
        const groupMessages = data.messages.reduce((acc, message) => {
          const senderId = message.from_user_id._id;
          if (!acc[senderId] || new Date(message.createdAt) > new Date(acc[senderId].createdAt)) {
            acc[senderId] = message;
          }
          return acc;
        }, {});

        const sortMessages = Object.values(groupMessages).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMessages(sortMessages)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }

  }
  useEffect(() => {
    if (user) {
      fetchRecentMessages();
      const intervalId = setInterval(() => {
        fetchRecentMessages();
      }, 30000);

      return () => clearInterval(intervalId);
    }
  }, [user]);

  return (
    <div className='bg-white max-w-xs mt-4 min-h-20 rounded-md shadow text-xs text-slate-800 p-4'>
      <h3 className='font-semibold text-slate-8 mb-4'>Tin nhắn gần đây</h3>
      <div className='flex flex-col max-h-56 overflow-y-scroll no-scrollbar'>
        {messages.map((message, index) => (
          <Link to={`/messages/${message.from_user_id._id}`} key={index} className='flex items-start gap-2 py-2 hover:bg-slate-100'>
            <img src={message.from_user_id.profile_picture} alt="" className='size-8 rounded-full' />
            <div className='w-full'>
              <div className='flex justify-between'>
                <p className='font-medium'>{message.from_user_id.full_name}</p>
                <p className='text-[10px] text-slate-400'>{moment(message.createdAt).fromNow()}</p>
              </div>
              <div className='flex justify-between'>
                <p className='text-gray-500'>{message.text ? message.text : 'Media'}</p>
                {
                  !message.seen && <p className='bg-indigo-500 text-white size-4 flex items-center
                  justify-center rounded-full text-[10px]'>
                    1
                  </p>
                }
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default ReccentMessages
