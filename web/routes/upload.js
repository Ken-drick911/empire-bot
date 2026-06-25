const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const auth = require('../middleware/authMiddleware')
const getDB = () => global._db

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads'))
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        const name = req.user.phone.replace(/\D/g, '') + '_' + file.fieldname + '_' + Date.now() + ext
        cb(null, name)
    }
})

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/
        const ok = allowed.test(path.extname(file.originalname).toLowerCase())
        if (ok) cb(null, true)
        else cb(new Error('Images only'))
    }
})

router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        const url = '/uploads/' + req.file.filename
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
        const url = '/uploads/' + req.file.filename
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
