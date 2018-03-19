var fs = require('fs-extra')
const {Track} = require('./models')

module.exports = {
    scan () {
        var newFiles = []
        var filteredFiles = []

        return fs.readdir('./content/tracks')
        .then(files => {
            /* Filter for only MP3 files */
            filteredFiles = files.filter(x => x.endsWith('.mp3'))
            // console.log(filteredFiles)
            return Track.findAll({attributes: ['filename']})
        })
        .then( dbTracks => {
            var dbFilenames = dbTracks.map( x => x.filename)
            filteredFiles.forEach(filename => {
                if (!dbFilenames.includes(filename)) {
                    newFiles.push(filename)
                }
            })
            
            return Track.bulkCreate(newFiles.map( filename => {
                var robj = {}
                robj['filename'] = filename
                robj['title'] = filename.slice(0, -4)
                return robj
            }),
            {
                individualHooks: true
            })
        })
    }
}