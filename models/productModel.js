import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    sizes: { type: Array, required: true },
    colors: { type: Array, default: [] },
    bestseller: { type: Boolean },
    date: { type: Number, required: true },
    reviews: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
            rating: { type: Number, min: 1, max: 5, required: true },
            comment: { type: String, default: '' },
            photos: { type: [String], default: [] },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 }
})

const productModel  = mongoose.models.product || mongoose.model("product",productSchema);

export default productModel