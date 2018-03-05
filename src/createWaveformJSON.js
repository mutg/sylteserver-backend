const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs')
const waveform = require('waveform')
const path = require('path')

if (!fs.existsSync('content/waveforms')) {
  fs.mkdirSync('content/waveforms')
}

module.exports = (mp3File) => {
  return new Promise((resolve, reject) => {
    var filename = path.basename(mp3File)
    waveform( mp3File, {
      'waveformjs': '-',
      'wjs-width': 800,
      'wjs-precision': 3
    }, (err, buf) => {
      if (err) {
        reject(err)
      } else {
        resolve(buf)
      }
    })
  }) 
}