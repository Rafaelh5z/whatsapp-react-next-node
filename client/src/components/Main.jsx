import React, { useEffect, useRef, useState } from "react"
import ChatList from "./Chatlist/ChatList"
import Empty from "./Empty"
import { onAuthStateChanged } from "firebase/auth"
import { firebaseAuth } from "@/utils/FirebaseConfig"
import { CHECK_USER_ROUTE, GET_MESSAGES_ROUTE, HOST } from "@/utils/ApiRoutes"
import { useRouter } from "next/router"
import { useStateProvider } from "@/context/StateContext"
import axios from "axios"
import { reducerCases } from "@/context/constants"
import Chat from "./Chat/Chat"
import { io } from "socket.io-client"
import SearchMessages from "./Chat/SearchMessages"

function Main() {

  const router = useRouter()
  const [{ userInfo, currentChatUser, messagesSearch }, dispatch] = useStateProvider()
  const [redirectLogin, setRedirectLogin] = useState(false)
  const socket = useRef()
  const [socketEvent, setSocketEvent] = useState(false)

  // Redirect to login if user is not logged in
  useEffect(() => {

    if (redirectLogin) {

      router.push("/login")
    }
  }, [redirectLogin])

  // Check if user is logged in
  onAuthStateChanged(firebaseAuth, async (currentUser) => {

    if (!currentUser) {
      
      setRedirectLogin(true)
    }

    if (!userInfo && currentUser?.email) {

      const { data } = await axios.post(CHECK_USER_ROUTE, { email: currentUser.email })

      if (!data.status) {
      
        router.push("/login")
      }

      const { id, email, name, profilePicture: profileImage, status } = data.data

      dispatch({
        type: reducerCases.SET_USER_INFO,
        userInfo: {
          id,
          email,
          name,
          profileImage,
          status
        }
      })
    }
  })

  // Connect to socket
  useEffect(() => {

    if (userInfo) {
      
      socket.current = io(HOST)
      socket.current.emit("add-user", userInfo.id)

      dispatch({
        type: reducerCases.SET_SOCKET,
        socket
      })
    }
  }, [userInfo])

  //
  useEffect(() => {

    if (socket.current && !socketEvent) {
      
      socket.current.on("msg-recieve", (data) => {

        dispatch({
          type: reducerCases.ADD_MESSAGE,
          newMessage: {
            ...data.message,
          }
        })
      })

      setSocketEvent(true)
    }
  }, [socket.current])

  // Get messages
  useEffect(() => {

    const getMessages = async () => {
      
      const { data: {messages} } = await axios.get(`${GET_MESSAGES_ROUTE}/${userInfo.id}/${currentChatUser.id}`)
    
      dispatch({
        type: reducerCases.SET_MESSAGES,
        messages
      })
    }

    if (currentChatUser?.id) {

      getMessages()
    }
  }, [currentChatUser])

  return (
    <>
      <div className="grid grid-cols-main h-screen w-screen max-h-screen max-w-full overflow-hidden">
        <ChatList />
        
        {
          currentChatUser 
            ? <div className={messagesSearch? "grid grid-cols-2" : "grid-cols-2"}>
              <Chat />

              {
                messagesSearch && <SearchMessages />
              }
            </div>
            : <Empty />
        }
      </div>
    </>
  )
}

export default Main
