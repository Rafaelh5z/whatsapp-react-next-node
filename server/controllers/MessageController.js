import getPrismaInstance from "../utils/PrismaClient.js"
import { renameSync } from "fs"

/**
 * Create a new message
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
export const addMessage = async (req, res, next) => {

    try {
        
        const prisma = getPrismaInstance() 

        const { message, from, to} = req.body
        const getUser = onlineUsers.get(to)

        if(message && from && to){
        
            const newMessage = await prisma.messages.create({
                data: {
                    message,
                    sender: {connect:{id: parseInt(from)}},
                    reciever: {connect:{id: parseInt(to)}},
                    messageStatus: getUser ? 'delivered' : 'sent'
                },
                include: {
                    sender: true,
                    reciever: true
                }
            })

            return res.status(201).send({
                message: newMessage,
            })
        }

        return res.status(400).send("Message, sender and reciever are required")
    } catch (err) {
        
        next(err)
    }
}

/**
 * Get all messages between two users
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns List of messages between two users
 */
export const getMessages = async (req, res, next) => {

    try {
        
        const prisma = getPrismaInstance()

        const { from, to } = req.params

        const messages = await prisma.messages.findMany({
            where: {
                OR: [
                    {
                        senderId: parseInt(from),
                        recieverId: parseInt(to)
                    },
                    {
                        senderId: parseInt(to),
                        recieverId: parseInt(from)
                    }
                ]
            },
            orderBy: {
                id: 'asc'
            }
        })

        const unreadMessages = []

        messages.forEach((message, index) => {

            if(message.messageStatus !== 'read' && message.senderId === parseInt(to)){

                messages[index].messageStatus = "read"
                unreadMessages.push(message.id)
            }
        })

        await prisma.messages.updateMany({
            where: {
                id: {
                    in: unreadMessages
                }
            },
            data: {
                messageStatus: "read"
            }
        })

        return res.status(200).json({
            messages
        })
    } catch (err) {
        
        next(err)
    }
}

/**
 * Add image message
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns status 201 if image is uploaded successfully or 400 if image is not uploaded
 */
export const addImageMessage = async (req, res, next) => {

    try {
        
        if (req.file) {
            
            const date = Date.now()

            let filename = "uploads/images/" + date + req.file.originalname
            renameSync(req.file.path, filename)

            const prisma = getPrismaInstance()

            const { from, to } = req.query

            if (from && to) {
                
                const message = await prisma.messages.create({
                    data: {
                        message: filename,
                        sender: { connect: { id: parseInt(from) } },
                        reciever: { connect: { id: parseInt(to) } },
                        messageStatus: 'sent',
                        type: 'image',
                    },
                })

                return res.status(201).json({
                    message
                })
            }

            return res.status(400).send("Sender and receiver are required")
        }

        return res.status(400).send("Image is required")
    } catch (err) {
        
        next(err)
    }
}

/**
 * Add audio message
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns status 201 if audio is uploaded successfully or 400 if audio is not uploaded
 */
export const addAudioMessage = async (req, res, next) => {

    try {
        
        if (req.file) {
            
            const date = Date.now()

            let filename = "uploads/recordings/" + date + req.file.originalname
            renameSync(req.file.path, filename)

            const prisma = getPrismaInstance()

            const { from, to } = req.query

            if (from && to) {
                
                const message = await prisma.messages.create({
                    data: {
                        message: filename,
                        sender: { connect: { id: parseInt(from) } },
                        reciever: { connect: { id: parseInt(to) } },
                        messageStatus: 'sent',
                        type: 'audio',
                    },
                })

                return res.status(201).json({
                    message
                })
            }

            return res.status(400).send("Sender and receiver are required")
        }

        return res.status(400).send("Audio is required")
    } catch (err) {
        
        next(err)
    }
}

export const getInitialContactsWithMessages = async (req, res, next) => {

    try {
        
        const userId = parseInt(req.params.from)
        const prisma = getPrismaInstance()
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                sentMessages: {
                    include: {
                        reciever: true,
                        sender: true
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                recievedMessages: {
                    include: {
                        reciever: true,
                        sender: true
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            }
        })

        const messages = [...user.sentMessages, ...user.recievedMessages]

        messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

        const users = new Map()
        const messagesStatusChange = []

        messages.forEach(msg => {
            
            const isSender = msg.senderId === userId
            const calculatedId = isSender ? msg.recieverId : msg.senderId

            if (msg.messageStatus === 'sent') {
                
                messagesStatusChange.push(msg.id)
            }

            const {id, type, message, messageStatus, createdAt, senderId, recieverId} = msg

            if (!users.get(calculatedId)) {
                
                let user = {
                    messageId: id,
                    type,
                    message,
                    messageStatus,
                    createdAt,
                    senderId,
                    recieverId,
                }

                if (isSender) {
                    
                    user = {
                        ...user,
                        ...msg.reciever,
                        totalUnreadMessages: 0,
                    }
                }else{

                    user = {
                        ...user,
                        ...msg.sender,
                        totalUnreadMessages: messageStatus !== 'read'? 1 : 0,
                    }
                }

                users.set(calculatedId, { ...user })
            }else if(messageStatus !== 'read' && !isSender){

                const user = users.get(calculatedId) 

                users.set(calculatedId, {
                    ...user,
                    totalUnreadMessages: user.totalUnreadMessages+1,
                })
            }
        })

        if (messagesStatusChange.length) {
            
            await prisma.messages.updateMany({
                where: {
                    id: {
                        in: messagesStatusChange
                    }
                },
                data: {
                    messageStatus: 'delivered'
                }
            })
        }

        return res.status(200).json({
            users: Array.from(users.values()),
            onlineUsers: Array.from(onlineUsers.keys())
        })
    } catch (error) {

        next(error)
    }
}