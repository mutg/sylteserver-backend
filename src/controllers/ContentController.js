const { Track } = require('../models')
const scanner = require('../scanner')
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

var isScanning = false

module.exports = {
  async getTracks(req, res) {
    var query = {
      where: {
      },
      order: [
        [(req.query.order) ? req.query.order : 'id',
        req.query.dir ? req.query.dir : 'DESC']
      ],
      limit: null,
      offset: null
    }

    if (req.query.title) query.where.title = req.query.title
    if (req.query.uri) query.where.uri = req.query.uri

    await Track.findAll(query)
    .then (tracks => {
      res.json(tracks)
    })
    .catch(error => {
      console.log(error)
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
  },
  async scanForTracks(req, res) {
    
    if (isScanning) {
      return res.status(400).send({
        error: 'Scan in progress'
      })
    }
    try {
      isScanning = true      
      var newTracks = await scanner.scan()
      res.json({count: newTracks.length})
    } catch (error) {
      res.status(403).send({error: error.toString()})
    } finally {
      isScanning = false
    }
  }
}
