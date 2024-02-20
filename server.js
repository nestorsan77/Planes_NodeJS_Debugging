const app = require('./index')

var port = 3000

//listen on port 3000
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })