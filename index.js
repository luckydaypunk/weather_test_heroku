const express = require('express')
const request = require("request")
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', async (req, res) => {
    let ip = req.headers['x-forwarded-for']
    if (ip){
      var list = ip.split(",");
      ip = list[list.length-1];
    } else {
      ip = req.connection.remoteAddress;
    }
    try {
      let loc = await getLoc(ip)
      let lat = loc.latitude
      let lon = loc.longitude
      console.log(loc)
      let weather = await getWeather(lat,lon)
      res.send(weather)

    } catch(err) {
      console.log(err);
      res.send('Sorry, it seems that something has gone wrong...')
    }
    
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
  let options = {
      url: 'http://api.ipstack.com/'+ip+'?access_key=' + process.env.IPSTACK_API_KEY
  };
  console.log(ip)
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
function getWeather(lat,lon) {
  let options = {
      url: 'https://api.darksky.net/forecast/'+process.env.DARKSKY_API_KEY+'/'+lat+','+lon+'?exclude=hourly,daily,flags&units=si'
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