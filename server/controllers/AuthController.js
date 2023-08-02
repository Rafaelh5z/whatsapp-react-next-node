import getPrismaInstance from "../utils/PrismaClient.js"

/**
 * Verify if the user exists in the database
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns json with status and user data
 */
export const checkUser = async(req, res, next) => {

    try {
        
        const {email} = req.body

        if(!email) return res.json({
            msg: 'Email is required',
            status: false
        })

        const prisma = getPrismaInstance()
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if(!user){
            return res.json({
                msg: 'User not found',
                status: false
            })
        }else{

            return res.json({
                msg: 'User found',
                status: true,
                data: user
            })
        }

    } catch (err) {
        
        next(err)
    }
}

/**
 * Register a new user in the database
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns json with status and user data
 */
export const onBoardUser = async (req, res, next) => {

    try {
        
        const { email, name, about, image:profilePicture } = req.body

        if(!email || !name || !profilePicture) {
            
            return res.send(
                "Email, name and profile picture are required"
            )
        }

        const prisma = getPrismaInstance()
        
        const user = await prisma.user.create({
            data: {
                email,
                name,
                about,
                profilePicture
            }
        })

        return res.json({
            msg: 'User created',
            status: true,
            user
        })

    } catch (err) {
        
        next(err)
    }
}

/**
 * Get a list of all users grouped by initial letter
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns json with status and user contacts
 */
export const getAllUsers = async (req, res, next) => {
    try {
        
        const prisma = getPrismaInstance()

        const users = await prisma.user.findMany({
            orderBy:{ 
                name: "asc" 
            },
            select: {
                id: true,
                name: true,
                email: true,
                about: true,
                profilePicture: true
            },
        })

        const usersGroupedByInitialLetter = {}

        users.forEach(user => {

            const initialLetter = user.name.charAt(0).toUpperCase()

            if(!usersGroupedByInitialLetter[initialLetter]){

                usersGroupedByInitialLetter[initialLetter] = []
            }

            usersGroupedByInitialLetter[initialLetter].push(user)
        })

        return res.status(200).send({
            users: usersGroupedByInitialLetter
        })

    } catch (err) {
        
        next(err)
    }
}