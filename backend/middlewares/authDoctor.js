import jwt from "jsonwebtoken"

//doctor authentication middleware
const authDoctor = async (req, res, next) => {
    try {
        const { dtoken } = req.headers
        if (!dtoken) {
            return res.status(401).json({ success: false, message: "Not Authorized Login Again" })
        }
        const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET)
        // Ensure token belongs to a Doctor
        if (token_decode.role !== "doctor") {
            return res.status(401).json({ success: false, message: "Not Authorized Login Again" })
        }

        req.docId = token_decode.id
        next()
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: err.message })
    }
}

export default authDoctor;