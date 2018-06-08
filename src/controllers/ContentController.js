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

function ScanStatus() {
  this.complete = false
  this.started = Date.now()
  this.ended = Date.now()
  this.tracks = []  
}

function ProcessingStatus() {
  this.complete = false
  this.started = Date.now()
  this.ended = Date.now()
  this.tracks = {}
  this.id = processingId++
}

var processingId = 0
var processing = {}
var scanStatus

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

          var uploadStatus = new ProcessingStatus()

          
          for (const trackKey in trackdata) {
            if (trackdata.hasOwnProperty(trackKey)) {
              const track = trackdata[trackKey]
              var obj = {
                title: track.title,
                status: {
                  done: false,
                  error: null
                }
              }
              uploadStatus.tracks[track.title] = obj              
            }
          }

          processing[uploadStatus.id] = uploadStatus

          // CLIENT GETS RESPONSE
          res.status(202).send(
            {
              upload_id: uploadStatus.id 
            }
          )

          Promise.all(tracks.map(t => {
            var data = trackdata[t.originalname]
            return Track.create({
              filename: t.originalname,
              title: data.title,
              description: data.description
            })
            .then(trackInstance => {
              uploadStatus.tracks[data.title].status.done = true
              uploadStatus.tracks[data.title].status.uri = trackInstance.uri
            })
            .catch(error => {
              uploadStatus.tracks[data.title].status.done = true
              uploadStatus.tracks[data.title].status.error = error.toString()
            })
          }))
          .then(() => {
            uploadStatus.complete = true
            uploadStatus.ended = Date.now()
          })
          .catch(err =>  {
            console.log(err)
          })

        } catch (error) {
          res.status(400).send({
            error: error.toString()
          })
        }
      }
    })
  },
  async getUploadStatus(req, res) {
    var id = req.params.upload_id
    try {
      res.json(processing[id])
    } catch (error) {
      res.json(400).send({
        error: error.toString()
      })      
    }
  },
  async scanForTracks(req, res) {
    if (isScanning) {
      return res.status(400).send({
        error: 'Scan in progress'
      })
    }
    scanStatus = new ScanStatus()
    isScanning = true      
    scanStatus.tracks = await scanner.scan()
    res.status(200).send(scanStatus)
    await Track.bulkCreate(scanStatus.tracks.map( filename => {
      var robj = {}
      robj['filename'] = filename
      robj['title'] = filename.slice(0, -4)
      return robj
    }),
    {
        individualHooks: true
    })
    isScanning = false
    scanStatus.complete = true
    scanStatus.ended = Date.now()
  },
  async getScanStatus(req, res) {
    if (!scanStatus) {
      return res.status(404).send()
    }
    res.status(200).send(scanStatus)
  }
}
