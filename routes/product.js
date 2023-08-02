const express = require('express')
const router = express.Router()
const { Product } = require('../models')
const Joi = require('joi')
const { isAdmin } = require('../middleware/auth')
const cloudinary = require('../utils/cloudinary')

module.exports = (cache) => {
    router.post('/', isAdmin, async (req, res) => {
        const schema = Joi.object({
            name: Joi.string().min(3).max(300).required(),
            brand: Joi.string().min(3).max(300).required(),
            description: Joi.string().min(3).required(),
            price: Joi.number().precision(2).required(),
            image: Joi.string().min(3).max(300).required(),
            categoryId: Joi.number().required()
        })

        const { error } = schema.validate(req.body)
        if (error) {
            return res.status(400).json({
                message: error.details[0].message
            })
        }
        const {
            name,
            brand,
            description,
            price,
            image,
            categoryId
        } = req.body
        const productExists = await Product.findOne({ where: { name } })
        if (productExists) {
            return res.status(400).json({
                message: "Product already exists"
            })
        }
        try {
            const uploadedResponse = await cloudinary.uploader.upload(image, {
                upload_preset: "ml_default"
            })
            if (uploadedResponse) {
                const product = await Product.create({
                    name,
                    brand,
                    description,
                    price,
                    image: uploadedResponse,
                    categoryId
                })

                res.status(201).json({
                    message: "Product created successfully",
                    product
                })
            } else {
                return res.status(400).json({
                    message: "Error uploading the image"
                })
            }
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    })

    router.get('/', async (req, res) => {
        const page = parseInt(req.query.page) || 1 //Get the requested page from the query params
        const limit = 5
        const offset = (page - 1) * limit // No. of records to skip

        try {
            // Check if cached data is available for the requested page
            const cachedData = cache.get(`/api/products?page=${page}`)
            if (cachedData) {
                return res.status(200).json(cachedData)
            }
            // Fetch the total count of products from the database
            const totalProducts = await Product.count()
            // Fetch products from the database with limit and offset
            const products = await Product.findAll({
                limit,
                offset
            })
            const data = {
                products,
                total: totalProducts
            }
            cache.put(`/api/products?page=${page}`, data, 60000) // Cache for 1 minute (60000 ms)

            res.status(200).json(data)

        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    })

    router.get('/:id', async (req, res) => {
        const id = req.params.id
        try {
            // Check if cached data is available for the requested page
            const cachedData = cache.get(`/api/products/${id}`)
            if (cachedData) {
                return res.status(200).json(cachedData)
            }
            const product = await Product.findByPk(id)
            cache.put(`/api/products/${id}`, product, 60000)

            res.status(200).json(product)
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    })

    router.patch('/:id', isAdmin, async (req, res) => {
        const id = req.params.id
        const existingProduct = await Product.findByPk(id)
        if (!existingProduct) {
            return res.status(400).json({
                message: `Product with id ${id} does not exist`
            })
        }
        const schema = Joi.object({
            name: Joi.string().min(3).max(300).required(),
            brand: Joi.string().min(3).max(300).required(),
            description: Joi.string().min(3).required(),
            price: Joi.number().precision(2).required(),
            image: Joi.string().min(3).max(300).required(),
            categoryId: Joi.number().required()
        })

        const { error } = schema.validate(req.body)
        if (error) {
            return res.status(400).json({
                message: error.details[0].message
            })
        }
        const {
            name,
            brand,
            description,
            price,
            image,
            categoryId
        } = req.body
        try {
            const uploadedResponse = await cloudinary.uploader.upload(image, {
                upload_preset: "ml_default"
            })
            if (uploadedResponse) {
                existingProduct.name = name
                existingProduct.brand = brand
                existingProduct.description = description
                existingProduct.price = price
                existingProduct.image = uploadedResponse
                existingProduct.categoryId = categoryId

                await existingProduct.save()
                res.status(200).json({
                    message: "Product updated successfully",
                    product: existingProduct
                })
            }
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    })

    return router
}


