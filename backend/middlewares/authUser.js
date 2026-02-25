import jwt from "jsonwebtoken"

//admin authentication middleware
const authUser = async (req, res, next) => {
    try {
        const { token } = req.headers
        if (!token) {
            return res.status(401).json({ success: false, message: "Not Authorized Login Again" })
        }
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        // Ensure token belongs to a User
        if (token_decode.role !== "user") {
            return res.status(401).json({ success: false, message: "Not Authorized Login Again" })
        }

        req.userId = token_decode.id
        next()
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: err.message })
    }
}

export default authUser;