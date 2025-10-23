import { configureStore } from '@reduxjs/toolkit'
import useReducer from '../features/user/userSlice.js'
import messagesReducer from '../features/messages/messagesSlice.js'
import connectionsReducer from '../features/connections/connectionsSlice.js'

export const store = configureStore({
  reducer: {
    user: useReducer,
    messages: messagesReducer,
    connections: connectionsReducer
  },
})