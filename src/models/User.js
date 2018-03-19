const bcrypt = require('bcrypt')

function hashPassword(user, options) {
    const SALT_FACTOR = 8

    if (!user.changed('password')) {
        return;
    }

    return bcrypt
        .genSalt(SALT_FACTOR)
        .then(salt =>  {
            console.log(`hashing password ${user.password} with salt: ${salt}`)
            return bcrypt.hash(user.password, salt)}
        )
        .then(hash => {
            console.log(`hash is ${hash}`)            
            user.setDataValue('password', hash)
        })
}


module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        username: {
            type: DataTypes.STRING,
            unique: true
        },
        password: DataTypes.STRING,
        fullname: DataTypes.STRING,
        admin: DataTypes.BOOLEAN
    }, {
        hooks: {
            beforeCreate: hashPassword
        }
    })

    User.prototype.comparePassword = function (password) {
        return bcrypt.compare(password, this.password)
    }

    return User
}