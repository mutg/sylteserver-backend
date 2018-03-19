const slug = require('slug')
const createWaveformJSON = require('../createWaveformJSON')
const colors = require('../colors')
const mp3Duration = require('mp3-duration')

function getDuration(track) {
    return new Promise((resolve, reject) => {
        mp3Duration('content/tracks/' + track, (e, duration) => {
            if (e !== null) return reject(e);
            resolve(duration);
        })
    })

}

function processTrack (track, options) {
    track.setDataValue('uri', slug(track.title))
    track.setDataValue('color', colors.getRandomColor())
    return createWaveformJSON(__dirname + '/../../content/tracks/' + track.filename)
            .then((buf) => {
                track.setDataValue('data', JSON.parse(buf.toString()))
                return getDuration(track.filename)
            })
            .then(duration => {
                track.setDataValue('duration', duration)
                
            })
}

module.exports = (sequelize, DataTypes) => {
    const Track = sequelize.define('Track', {
        title: {
            type: DataTypes.STRING,
            unique: true
        },
        filename: {
            type: DataTypes.STRING,
            unique: true
        },
        uri: {
            type: DataTypes.STRING,
            unique: true,
            defaultValue: null,
            allowNull: true
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        data: {
            type: DataTypes.JSON
        },
        duration: {
            type: DataTypes.FLOAT,
            defualtValue: 0
        },
        plays: {
            type: DataTypes.INTEGER,
            defualtValue: 0
        },
        color: {
            type: DataTypes.STRING,
            defaultValue: '#000000'
        }
    }, {
        hooks: {
            beforeCreate: processTrack
        }
    })
    return Track
}
