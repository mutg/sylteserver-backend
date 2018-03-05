const Joi = require('joi')

module.exports = {
  register (req, res, next) {
    const schema = {
      username: Joi.string().regex(
        new RegExp('^[a-zA-Z0-9]{1,32}$')
      ),
      password: Joi.string().regex(
        new RegExp('^[a-zA-Z0-9]{1,32}$')
      )
    }

    const {error, value} = Joi.validate(req.body, schema)

    if (error) {
      switch(error.details[0].context.key) {
        case 'username':
          res.status(400).send({
            error: 'Du må oppgi et godkjekt brukernamn'
          })
          break
        case 'password':
          res.status(400).send({
            error: 'Ikke godkjent passord'
          })
        default:
          res.status(400).send({
            error: 'Feil under registrering av bruker'
          })
      }
    } else {
      next()
    }

  }

}