import jwt from "jsonwebtoken"

//admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {
        const { atoken } = req.headers
        if (!atoken) {
            return res.status(401).json({ success: false, message: "Not Authorized Login Again" })
        }
        const token_decode = jwt.verify(atoken, process.env.JWT_SECRET)
        // Ensure token belongs to an Admin
        if (token_decode.role !== "admin" || token_decode.email !== process.env.ADMIN_EMAIL) {
            return res.status(401).json({ success: false, message: "Not Authorized Login Again" })
        }
        next()
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: err.message })
    }
}

export default authAdmin;