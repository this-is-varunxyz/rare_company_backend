import jwt from 'jsonwebtoken'

const authUser = async (req, res, next) => {

    const bearer = req.headers.authorization || ''
    const headerToken = (bearer.startsWith('Bearer ') ? bearer.split(' ')[1] : null)
    const token = req.headers.token || headerToken

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not Authorized. Login again.' })
    }

    try {

        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = token_decode.id
        // keep compatibility for JSON bodies; note: multipart parsers may overwrite req.body
        req.body.userId = token_decode.id
        next()

    } catch (error) {
        console.log(error)
        res.status(401).json({ success: false, message: 'Invalid token' })
    }

}

export default authUser