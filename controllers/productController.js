import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"

// function for add product
const addProduct = async (req, res) => {
    try {

        const { name, description, price, category, subCategory, sizes, colors, bestseller } = req.body

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            colors: colors ? JSON.parse(colors) : [],
            image: imagesUrl,
            date: Date.now()
        }

        console.log(productData);

        const product = new productModel(productData);
        await product.save()

        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for list product
const listProducts = async (req, res) => {
    try {
        
        const products = await productModel.find({});
        res.json({success:true,products})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for removing product
const removeProduct = async (req, res) => {
    try {
        
        await productModel.findByIdAndDelete(req.body.id)
        res.json({success:true,message:"Product Removed"})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {
        
        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({success:true,product})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// add or update a product review with optional photos
const addReview = async (req, res) => {
    try {
        const productId = req.params.id
        const userId = req.userId || req.body.userId
        const { rating, comment } = req.body

        if (!rating) {
            return res.json({ success: false, message: 'Rating is required' })
        }

        const product = await productModel.findById(productId)
        if (!product) {
            return res.json({ success: false, message: 'Product not found' })
        }

        if (!Array.isArray(product.reviews)) {
            product.reviews = []
        }

        // handle photo uploads if any
        let photoUrls = []
        if (req.files && req.files.length > 0) {
            const uploads = await Promise.all(
                req.files.map(async (file) => {
                    try {
                        const resUpload = await cloudinary.uploader.upload(file.path, { resource_type: 'image' })
                        return resUpload.secure_url
                    } catch (e) {
                        return null
                    }
                })
            )
            photoUrls = uploads.filter(Boolean)
        }

        // check if user already reviewed -> update
        const existingIndex = product.reviews.findIndex(r => String(r.user) === String(userId))
        if (existingIndex >= 0) {
            product.reviews[existingIndex].rating = Number(rating)
            product.reviews[existingIndex].comment = comment || ''
            if (photoUrls.length > 0) {
                product.reviews[existingIndex].photos = photoUrls
            }
            product.reviews[existingIndex].createdAt = new Date()
        } else {
            product.reviews.push({ user: userId, rating: Number(rating), comment: comment || '', photos: photoUrls })
        }

        // recalc aggregates
        const numReviews = product.reviews.length
        const averageRating = numReviews === 0 ? 0 : product.reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0) / numReviews
        product.numReviews = numReviews
        product.averageRating = Number(averageRating.toFixed(2))

        await product.save()
        res.json({ success: true, product })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// get product reviews (read-only)
const getReviews = async (req, res) => {
    try {
        const productId = req.params.id
        const product = await productModel.findById(productId)
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' })
        }
        res.json({ success: true, reviews: product.reviews || [], averageRating: product.averageRating || 0, numReviews: product.numReviews || 0 })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

export { listProducts, addProduct, removeProduct, singleProduct, addReview, getReviews }