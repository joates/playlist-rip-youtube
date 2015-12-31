;
var handled_errors = {
    'Code 100': '[Deleted Video]'
  , 'Code 150': '[Blocked Video: Contains copyrighted content]'
}

var fs   = require('fs')
  , ytdl = require('ytdl-core')
  , join = require('path').join
  , argv = require('minimist')(process.argv.slice(2))

var list_id  = argv._[0] || 'PLpRjkOHBe_TgmznCle__jWDhoV4aFgCjw'
  , protocol = 'https://'
  , host  = 'youtube.com'
  , path  = '/playlist?list='
  , url   = protocol + host + path + list_id
  , parse = require('./lib/parse-playlist')
  , cwd   = process.cwd()

function decode_title(title) {
  title = title
    .replace(/-/g, '_')
    .replace(/[^a-zA-Z0-9 _]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+_-+/g, '_')

  return title
}

console.log('\nPlease wait for all downloads to complete..')
console.log('(can take several minutes, depending on connection speed)\n')

parse(url, function(err, id) {
  if (err) console.error(err.message, err.stack)

  var title = id.substr(9) +'.mp3'
  var target = protocol + host + id
  console.log('url: '+ target)

  ytdl(target, { filter: 'audioonly' })
    .on('info', function(data) {
      title = decode_title(data.title)
      console.log(data.video_id +' >> '+ title)
      fs.rename(join(cwd, data.video_id) +'.mp3', join(cwd, title) +'.mp3', function(err, data) {
        if (err) console.error(err.message, err.stack)
      })
    })
    .on('error', function(err) {
      if (! handled_errors[err.message.substr(0, 8)]) {
        console.error(err.message, err.stack)
        process.exit(1)
      } else {
        var k = err.message.substr(0, 8)
        var v = handled_errors[k]
        console.log('Warning: '+ k +' '+ v)
      }
    })
    .pipe(fs.createWriteStream(join(cwd, title)))
})
