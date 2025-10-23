import { useAuth } from '@clerk/clerk-react'
import { ArrowLeft, Sparkle, TextIcon, Upload } from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../api/axios'

const StoryModal = ({ setShowModal, fetchStories }) => {

  const bgColors = ["#4f46e5", "#7c3aed", "#db2777", "#e11d48", "#ca8a04", "#0d9488"]

  const [mode, setMode] = useState("text")
  const [background, setBackground] = useState(bgColors[0])
  const [text, setText] = useState("")
  const [media, setMedia] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const { getToken } = useAuth()

  const MAX_VIDEO_DURATION = 30; // in seconds
  const MAX_VIDEO_SIZE = 50; // 50 MB

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith('video/')) {
        if (file.size > MAX_VIDEO_SIZE * 1024 * 1024) {
          toast.error(`File video không được vượt quá ${MAX_VIDEO_SIZE} MB.`)
          setMedia(null)
          setPreviewUrl(null)
          return;
        }
        const video = document.createElement('video')

        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > MAX_VIDEO_DURATION) {
            toast.error(`Video không được dài quá ${MAX_VIDEO_DURATION} giây.`)
            setMedia(null)
            setPreviewUrl(null)
          } else {
            setMedia(file)
            setPreviewUrl(URL.createObjectURL(file))
            setText("")
            setMode('media')
          }
        }

        video.src = URL.createObjectURL(file)
      } else if (file.type.startsWith('image/')) {
        setMedia(file)
        setPreviewUrl(URL.createObjectURL(file))
        setText("")
        setMode('media')
      }
    }
  }

  const handleCreateStory = async () => {
    const media_type = mode === 'media' ? media?.type.startsWith('image') ? 'image' : 'video' : 'text';

    if (media_type === 'text' && !text) {
      throw new Error("Vui lòng nhập một vài chữ cho tin của bạn.")
    }

    let formData = new FormData();
    formData.append('content', text);
    formData.append('media_type', media_type);
    formData.append('media', media);
    formData.append('background_color', background);

    const token = await getToken()
    try {
      const { data } = await api.post('/api/story/create', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (data.success) {
        setShowModal(false)
        toast.success('Tin của bạn đã được tạo thành công!')
        fetchStories()
      } else {
        toast.error('Có lỗi xảy ra, vui lòng thử lại!')
      }

    } catch (error) {
      toast.error(error.message)
    }
  }
  return (
    <div className='fixed inset-0 z-110 min-h-screen bg-black/80 backdrop-blur text-white
    flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-4 flex items-center justify-between'>
          <button onClick={() => setShowModal(false)} className='text-white p-2 cursor-pointer'>
            <ArrowLeft />
          </button>
          <h2 className='text-lg font-semibold'>Create Story</h2>
          <span className='w-10'></span>
        </div>

        <div className='rounded-lg h-96 flex items-center justify-center relative' style={{ backgroundColor: background }}>
          {
            mode === 'text' && (
              <textarea className='bg-transparent text-white w-full h-full p-6 text-lg resize-none
            focus:outline-none' placeholder="What's on your mind ?"
                onChange={(e) => setText(e.target.value)} value={text} />
            )
          }
          {
            mode === 'media' && previewUrl && (
              media?.type.startsWith('image') ? (
                <img src={previewUrl} alt="" className='object-contain max-w-full' />
              ) : (
                <video src={previewUrl} className='object-contain max-w-full' />
              )
            )
          }
        </div>

        <div className='flex mt-4 gap-2'>
          {
            bgColors.map(color => (
              <button key={color} className='w-6 h-6 rounded-full ring cursor-pointer' style={{ backgroundColor: color }}
                onClick={() => setBackground(color)} />
            ))
          }
        </div>

        <div className='flex gap-2  mt-4'>
          <button onClick={() => { setMode('text'); setMedia(null); setPreviewUrl(null) }}
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer
            ${mode === 'text' ? "bg-white text-black" : "bg-zinc-800"}`}>
            <TextIcon size={18} /> Text
          </button>
          <label className={`flex-1 flex items-center justify-center gap-2 p-2 cursor-pointer
          ${mode === 'media' ? "bg-white text-black" : "bg-zinc-800"}`}>
            <input type="file" name="" id=""
              accept='image/*, video/*'
              className='hidden'
              onChange={handleMediaUpload} />
            <Upload size={18} />Photo/Video
          </label>
        </div>
        <button onClick={() => toast.promise(handleCreateStory(), {
          loading: 'Saving...'
        })}
          className='flex items-center justify-center gap-2 text-white py-3 mt-4 w-full rounded 
        bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
        active:scale-95 transition cursor-pointer'>
          <Sparkle size={18} /> Create Story
        </button>
      </div>
    </div>
  )
}

export default StoryModal
