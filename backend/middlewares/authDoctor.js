import jwt from "jsonwebtoken"

//doctor authentication middleware
const authDoctor = async (req, res, next) => {
    try {
        const { dtoken } = req.headers
        if (!dtoken) {
            return res.json({ success: false, message: "Not Authorized Login Again" })
        }
        const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET)
        req.body = req.body || {};
        req.body.docId = token_decode.id
        next()
    } catch (err) {
        console.log(err)
        res.json({ success: false, message: err.message })
    }
}

export default authDoctor;