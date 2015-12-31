;
module.exports = function(url, cb) {
  var http  = require('follow-redirects').http
    , https = require('follow-redirects').https
    , util  = require('util')
    , join  = require('path').join
    , stream  = require('stream')
    , trumpet = require('trumpet')
    , tr = trumpet()

  //BufferStream
  function BufferStream(src) {
    if (!Buffer.isBuffer(src)) {
      cb(new Error('input is not typeof Buffer'))
    }

    stream.Readable.call(this)

    this._source = src
    this._offset = 0
    this._length = src.length
    this.on('end', this._destroy)
  }
  util.inherits(BufferStream, stream.Readable)

  BufferStream.prototype._destroy = function() {
    this._source = null
    this._offset = null
    this._length = null
  }

  BufferStream.prototype._read = function(size) {
    if (this._offset < this._length) {
      this.push(this._source.slice(this._offset, (this._offset + size)))
      this._offset += size
    }
    if (this._offset >= this._length) {
      this.push(null)
    }
  }

  //Parse
  var selector = '.pl-video-thumb'
  tr.selectAll(selector, function(html) {
    var rs = html.createReadStream()
    cb(null, rs)
  })

  //Request
  https.get(url, function(res) {

/**
  https.request({
      host: host
    , path: path
    , maxRedirects: 12
  }, function(res) {
*/

    var body = ''
    res.setEncoding('utf8')
    res.on('data', function(chunk) {
      body += chunk
    })
    //res.on('error', function(err) {
    //  if (parseInt(err.statusCode / 100) !== 3) {
    //    cb(new Error('playlist ID not recognized'))
    //  }
    //})
    res.on('end', function() {
      new BufferStream(new Buffer(body)).pipe(tr)
    })
  })
}
