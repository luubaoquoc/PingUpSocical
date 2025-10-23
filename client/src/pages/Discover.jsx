import React, { useState } from 'react'
import { dummyConnectionsData } from '../assets/assets'
import { Search } from 'lucide-react'
import UserCard from '../components/UserCard'
import Loading from '../components/Loading'
import api from '../api/axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchUser } from '../features/user/userSlice'

const Discover = () => {

  const dispatch = useDispatch()
  const [input, setInput] = useState('')
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { getToken } = useAuth()


  const handleSearch = async (e) => {
    if (e.key === 'Enter') {
      try {
        setUsers([])
        setIsLoading(true)
        const token = await getToken()
        const { data } = await api.post('/api/user/discover', { input }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        data.success ? setUsers(data.users) : toast.error(data.message)
        setIsLoading(false)
        setInput('')
      } catch (error) {
        toast.error(error.message)
      }
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getToken().then(async (token) => {
      dispatch(fetchUser(token))
    })
  }, [])
  return (
    <div className='min-h-screen bg-gradient-to-r from-slate-50 to-white'>
      <div className='max-w-6xl mx-auto p-6'>
        {/* Title */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Khám Phá</h1>
          <p className='text-slate-600'>Kết nối với những người tuyệt vời và mở rộng mạng lưới của bạn</p>
        </div>
        {/* Search */}
        <div className='mb-8 shadow-md rounded-md border border-slate-200/60 bg-white/80'>
          <div className='p-6'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 size-5' />
              <input type='text'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyUp={handleSearch}
                placeholder='Tìm kiếm người dùng...'
                className='pl-10 sm:pl-12 py-2 w-full border border-gray-300 rounded-md 
                focus:outline-none  max-sm:text-sm' />
            </div>
          </div>
        </div>
        {/* Users List */}
        <div className='flex flex-wrap gap-6'>
          {users.map((user) => (
            <UserCard user={user} key={user._id} />
          ))}
        </div>
        {isLoading && (<Loading height='60vh' />)}
      </div>
    </div>
  )
}

export default Discover
