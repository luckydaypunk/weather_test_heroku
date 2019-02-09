const express = require('express')
const request = require("request")
const moment = require('moment')
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
      let data = {
        'loc':loc.region_name,
        'temp': Math.round(weather.currently.temperature),
        'icon': weather.currently.icon,
        'summary': weather.currently.summary,
        'time': moment(weather.currently.time,'x').format('LT')
      }
      res.send(data)

    } catch(err) {
      console.log(err);
      res.send('Sorry, it seems that something has gone wrong...')
    }
    
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`))

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