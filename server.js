const express = require('express')
const app = express()
const cacheController = require('express-cache-controller')
const staticGzip = require('express-static-gzip')
const cors = require('cors')
const cache = require('memory-cache')

const allProducts = require('./allProducts')
const userRoutes = require('./routes/user')
const categoryRoutes = require('./routes/category')
const productRoutes = require('./routes/product')

require('dotenv').config()

// Enable caching
app.use(cacheController({
    maxAge: 60 // Cache for 1 minute
}))

// Serve static files with compression
app.use(staticGzip('public'))

app.use(express.json())
app.use(cors())

app.get("/", (req, res) => {
    res.send("Welcome our to online shop API...");
});

app.use('/api/users', userRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/products', productRoutes(cache)) // Pass the cache object to the product routes

app.get('/products', (req, res) => {
    res.send(allProducts)
})

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})