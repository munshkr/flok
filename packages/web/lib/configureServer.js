const fs = require('fs')
const path = require('path')

// if production, force https
module.exports = (app,secure) => {
  if(secure){
    var privateKeyPath = process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY : path.join(__dirname, '../certs/key.pem')
    var certificatePath = process.env.CERTIFICATE ? process.env.CERTIFICATE : path.join(__dirname, '../certs/certificate.pem')
    var privateKey = fs.readFileSync(privateKeyPath, 'utf8')
    var certificate = fs.readFileSync(certificatePath, 'utf8')
    var credentials = {key: privateKey, cert: certificate}
    return require('https').createServer(credentials, app)
  }else{
    return require('http').createServer(app);
  }
}
