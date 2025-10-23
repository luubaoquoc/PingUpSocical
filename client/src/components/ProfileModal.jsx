import React, { useState } from 'react'
import { Pencil } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { updateUser } from '../features/user/userSlice'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'


const ProfileModal = ({ setShowEdit }) => {

  const dispatch = useDispatch()
  const { getToken } = useAuth()

  const user = useSelector((state) => state.user.value)
  const [editForm, setEditForm] = useState({
    full_name: user.full_name,
    username: user.username,
    bio: user.bio,
    profile_picture: null,
    cover_photo: null,
    location: user.location,
  })

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    try {

      const userData = new FormData()
      const { full_name, username, bio, profile_picture, cover_photo, location } = editForm
      userData.append('full_name', full_name)
      userData.append('username', username)
      userData.append('bio', bio)
      userData.append('location', location)
      profile_picture && userData.append('profile', profile_picture)
      cover_photo && userData.append('cover', cover_photo)
      const token = await getToken()
      dispatch(updateUser({ userData, token }))

      setShowEdit(false)
    } catch (error) {
      toast.error(error.message)
    }
  }
  return (
    <div className='fixed inset-0 z-110 h-screen overflow-y-scroll bg-black/50'>
      <div className='max-w-2xl sm:py-6 mx-auto'>
        <div className='bg-white rounded-lg shadow p-6'>
          <h1 className='text-2xl font-bold text-gray-900 mb-6'>Cập nhật hồ sơ</h1>

          <form className='space-y-4' onSubmit={e => toast.promise(
            handleSaveProfile(e), {
            loading: 'Đang lưu thay đổi...',
            success: 'Hồ sơ đã được cập nhật!',
            error: 'Lỗi khi cập nhật hồ sơ!',
          })}>

            {/* Cover Photo */}
            <div className='flex flex-col items-start gap-3'>
              <label htmlFor="cover_photo" className='block text-sm font-medium text-gray-700 mb-1'>
                Ảnh bìa
                <input hidden type="file" id="cover_photo" accept='image/*'
                  className='w-full p-3 border border-gray-200 rounded-lg'
                  onChange={(e) => setEditForm({ ...editForm, cover_photo: e.target.files[0] })} />
                <div className='group/profile relative'>
                  <img src={editForm.cover_photo ? URL.createObjectURL(editForm.cover_photo)
                    : user.cover_photo} alt=""
                    className='w-160 h-40 rounded-lg object-cover mt-2' />

                  <div className='absolute hidden group-hover/profile:flex inset-0 bg-black/20
                  rounded-lg items-center justify-center'>
                    <Pencil className='size-5 text-white' />
                  </div>
                </div>
              </label>
            </div>
            {/* profile_picture */}
            <div className='flex flex-col items-start gap-3'>
              <label htmlFor="profile_picture" className='block text-sm font-medium text-gray-700 mb-1'>
                Ảnh đại diện
                <input hidden type="file" id="profile_picture" accept='image/*'
                  className='w-full p-3 border border-gray-200 rounded-lg'
                  onChange={(e) => setEditForm({ ...editForm, profile_picture: e.target.files[0] })} />
                <div className='group/profile relative'>
                  <img src={editForm.profile_picture ? URL.createObjectURL(editForm.profile_picture)
                    : user.profile_picture} alt=""
                    className='size-24 rounded-full object-cover mt-2' />

                  <div className='absolute hidden group-hover/profile:flex inset-0 bg-black/20
                  rounded-full items-center justify-center'>
                    <Pencil className='size-5 text-white' />
                  </div>
                </div>
              </label>
            </div>


            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Họ tên
              </label>
              <input type="text" name="" id=""
                className='w-full p-3 border border-gray-200 rounded-lg outline-none'
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                value={editForm.full_name} />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Biệt danh
              </label>
              <input type="text" name="" id=""
                className='w-full p-3 border border-gray-200 rounded-lg outline-none'
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                value={editForm.username} />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Tiểu sử
              </label>
              <textarea name="" id="" rows={3}
                className='w-full p-3 border border-gray-200 rounded-lg outline-none'
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                value={editForm.bio} />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Địa chỉ
              </label>
              <input type="text" name="" id=""
                className='w-full p-3 border border-gray-200 rounded-lg outline-none'
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                value={editForm.location} />
            </div>

            <div className='flex justify-end space-x-3 pt-6'>
              <button type='button' onClick={() => setShowEdit(false)}
                className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700
              hover:bg-gray-50 transition-colors cursor-pointer'>
                Hủy
              </button>
              <button type='submit'
                className='px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white
              rounded-lg hover:from-indigo-600 hover:to-purple-700 transition cursor-pointer'>
                Lưu
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfileModal
