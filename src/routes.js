const ContentController = require('./controllers/ContentController')
const AuthenticationController = require('./controllers/AuthenticationController')
const AuthenticationControllerPolicy = require('./controllers/AuthenticationControllerPolicy')
const isAuthenticated = require('./isAuthenticated')

module.exports = (app) => {
    app.post('/register',
        AuthenticationControllerPolicy.register,
        AuthenticationController.register),
    app.post('/login',
        AuthenticationController.login)
    app.get('/tracks',
        ContentController.getTracks)
    app.post('/tracks',
        isAuthenticated,
        ContentController.uploadTracks)
    app.post('/session',
        isAuthenticated,
        AuthenticationController.session
    )
    app.post('/scan',
        isAuthenticated,
        ContentController.scanForTracks)
}