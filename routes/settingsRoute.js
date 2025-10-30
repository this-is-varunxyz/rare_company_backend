import express from 'express'
import adminAuth from '../middleware/adminAuth.js'
import upload from '../middleware/multer.js'
import { getSettings, updateHeroImage } from '../controllers/settingsController.js'

const settingsRouter = express.Router()

settingsRouter.get('/', getSettings)
settingsRouter.post('/hero-image', adminAuth, upload.single('image'), updateHeroImage)

export default settingsRouter


