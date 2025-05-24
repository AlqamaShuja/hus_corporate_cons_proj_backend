const logReqBody = (req, res, next) => {
    console.log('\n', req.method, req.originalUrl, ' ===> ', '\n')
    console.table(req.body)
    req.file && console.log(req.file)
    req.files && console.log(req.files)
    next()
  }
  
  module.exports = logReqBody