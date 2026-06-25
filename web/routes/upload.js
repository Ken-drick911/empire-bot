const express = require('express')
const router = express.Router()
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const auth = require('../middleware/authMiddleware')
const getDB = () => global._db

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = multer.memoryStorage()
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/
        const ok = allowed.test(file.mimetype)
        if (ok) cb(null, true)
        else cb(new Error('Images only'))
    }
})

const uploadToCloud = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder: `empire/${folder}`, resource_type: 'image' },
            (err, result) => {
                if (err) reject(err)
                else resolve(result.secure_url)
            }
        ).end(buffer)
    })
}

router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        const url = await uploadToCloud(req.file.buffer, 'avatars')
        await getDB().collection('users').updateOne(
            { phone: req.user.phone },
            { $set: { avatar: url } }
        )
        res.json({ success: true, url })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.post('/cover', auth, upload.single('cover'), async (req, res) => {
    try {
        const url = await uploadToCloud(req.file.buffer, 'covers')
        await getDB().collection('users').updateOne(
            { phone: req.user.phone },
            { $set: { cover: url } }
        )
        res.json({ success: true, url })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router
