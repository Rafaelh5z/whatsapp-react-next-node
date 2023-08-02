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