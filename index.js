const express = require('express')
const request = require("request")
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let loc = await getLoc(ip)
    res.end(loc)
  })
  .get('/times', (req, res) => res.send(showTimes()))
  .listen(PORT, () => console.log(`Listening on ${PORT}`))

let showTimes = () => {
  let result = ''
  const times = process.env.TIMES || 5
  for (i = 0; i < times; i++) {
    result += i + ' '
  }
  return result;
}

function getLoc(ip) {
  var options = {
      url: 'http://api.ipstack.com/'+ip+'?access_key=' + process.env.IPSTACK_API_KEY
  };
  return new Promise(function(resolve, reject) {
      request.get(options, function(err, res, body) {
          if (err) {
              reject(err);
          } else {
              resolve(JSON.parse(body));
          }
      })
  })
}