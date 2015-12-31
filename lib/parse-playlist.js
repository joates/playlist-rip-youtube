;
module.exports = function(url, cb) {
  var concat = require('concat-stream')
    , fetch  = require('./fetch-playlist')

  fetch(url, function(err, stream) {
    if (err) { cb(err); return }

    stream.pipe(concat(function (html) {
      html = html.toString('utf8')
      var link = html.match(/href=\"\/watch\?v=.*?\&/g)
      link = link.toString('utf8').slice(6, -1)
      cb(null, link)
    }))
  })
}
