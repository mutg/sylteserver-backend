const { Track } = require('../models')
const multer = require('multer')
const storage = multer.diskStorage({
  destination: 'content/tracks/',
  filename (req, file, cb) {
    cb(null, file.originalname)
  }
})

var upload = multer(
  { 
    storage,
    fileFilter: function(req, file, cb){
      if (file.mimetype !== 'audio/mp3' && file.mimetype !== 'audio/mpeg') {
        cb(new Error('Wrong filetype! Accepts only MP3 ya drangus'))
      } else {
        cb(null, true)
      }
    },

  }
)
.any()


module.exports = {
  async getTracks(req, res) {
    await Track.findAll({where: req.query})
    .then (tracks => {
      res.json(tracks)
    })
  },
  async uploadTracks(req, res) {
    return upload(req, res, function(err) {
      if (err) {
        return res.status(400).send({
          error: err.toString()
        })
      } else {
        
        try {
          let trackdata = JSON.parse(req.body.data)
          let tracks = req.files
          
          console.log(tracks) 
          console.log(trackdata) 

          var promises = []

          for (let x = 0; x < tracks.length; x++) {
            const track =tracks[x]
            let p = Track.create({
              filename: track.originalname,
              title: trackdata[track.originalname].title,
              description: trackdata[track.originalname].description
            })
            promises.push(p)
          }

          Promise.all(promises)
          .then(() => {
            res.send('Upload successful')
          })
          .catch( err =>  {
            res.status(400).send({
              error: err.toString()
            })
          })

        } catch (error) {
          res.status(400).send({
            error: error.toString()
          })
        }
      }
    })
  }
}
