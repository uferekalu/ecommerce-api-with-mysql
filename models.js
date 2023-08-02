const { Sequelize, DataTypes } = require('sequelize')
const bcrypt = require('bcrypt')
require('dotenv').config()

const sequelize = new Sequelize(process.env.DB, process.env.USERNAME, process.env.PASSWORD, {
    host: process.env.HOST,
    dialect: 'mysql'
})

// Define User model
const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
            const salt = bcrypt.genSaltSync(10)
            const hashedPassword = bcrypt.hashSync(value, salt)
            this.setDataValue('password', hashedPassword)
        }
    },
    isAdmin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
})

// Define Product model
const Product = sequelize.define('Product', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    brand: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    image: {
        type: DataTypes.BLOB,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        field: 'createdAt' // Specify the correct column name
    },
    updatedAt: {
        type: DataTypes.DATE,
        field: 'updatedAt' // Specify the correct column name
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'categoryId' // Specify the correct column name
    }
})

// Define Order model
const Order = sequelize.define('Order', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'userId' // Specify the correct column name
    },
    customerId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    paymentIntentId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    products: {
        type: DataTypes.JSON,
        allowNull: false
    },
    subTotal: {
        type: DataTypes.JSON,
        allowNull: false
    },
    total: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    shipping: {
        type: DataTypes.JSON,
        allowNull: true
    },
    delivery_status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Pending'
    },
    payment_status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        field: 'createdAt' // Specify the correct column name
    },
    updatedAt: {
        type: DataTypes.DATE,
        field: 'updatedAt' // Specify the correct column name
    }
})

// Define Category model
const Category = sequelize.define('Category', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        field: 'createdAt' // Specify the correct column name
    },
    updatedAt: {
        type: DataTypes.DATE,
        field: 'updatedAt' // Specify the correct column name
    }
})

// Define associations
User.hasMany(Order)
Order.belongsTo(User, { foreignKey: 'userId' })
Product.belongsTo(Category, { foreignKey: 'categoryId' })

// Sync the models with the database
sequelize.sync()

module.exports = {
    User,
    Product,
    Order,
    Category
}
