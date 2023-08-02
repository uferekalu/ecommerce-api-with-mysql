const express = require('express')
const router = express.Router()
const { Category } = require('../models')
const { isAdmin } = require('../middleware/auth')
const Joi = require('joi')

router.post('/', isAdmin, async (req, res) => {
    try {
        const schema = Joi.object({
            name: Joi.string().min(3).max(100).required()
        })

        const { error } = schema.validate(req.body)
        if (error) {
            return res.status(400).json({
                message: error.details[0].message
            })
        }
        const { name } = req.body
        // Check if category already exists
        let category = await Category.findOne({ where: { name } })
        if (category) {
            return res.status(400).json({
                message: `Category with name ${name} already exists`
            })
        }
        category = await Category.create({
            name
        })

        res.status(201).json({
            message: "Category created successfully!",
            category
        })
    } catch (error) {
        res.status(500).json({
            message: 'An error occured', error
        })
    }
})

router.get('/', async (req, res) => {
    try {
        const categories = await Category.findAll()
        res.status(200).json({
            categories
        })
    } catch (error) {
        res.status(500).json({
            message: 'An error occured', error
        })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id
        const category = await Category.findByPk(id)
        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            })
        } else {
            res.status(200).json({
                category
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'An error occured', error
        })
    }
})

router.put('/:id', isAdmin, async (req, res) => {
    try {
        const id = req.params.id
        const schema = Joi.object({
            name: Joi.string().min(3).max(100).required()
        })
        const { error } = schema.validate(req.body)
        if (error) {
            return res.status(400).json({
                message: error.details[0].message
            })
        }
        let category = await Category.findByPk(id)
        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            })
        }
        const { name } = req.body
        category.name = name
        category.save()

        res.status(200).json({
            category
        })
    } catch (error) {
        res.status(500).json({
            message: 'An error occured', error
        })
    }
})

module.exports = router