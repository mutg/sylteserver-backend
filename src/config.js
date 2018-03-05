module.exports = {
    port: process.env.PORT || 3000,
    db: {
        database: process.env.DB_NAME || 'sylteserver',
        user: process.env.DB_USER || 'sylteserver',
        password: process.env.DB_PASS || 'sylteserver',
        options:{
            dialect: 'sqlite',
            host: process.env.HOST || 'localhost',
            storage: './sylteserver.sqlite'
        }
    },
    authentication: {
        jwtSecret: process.env.JWT_SECRET || 'secret'
    }
    
}