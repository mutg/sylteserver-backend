module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('Comment', {
        context: {
            type: DataTypes.INTEGER
        },
        text: {
            type: DataTypes.STRING
        },
        author: DataTypes.INTEGER,
    }, {
        hooks: {
        }
    })
    return User
}