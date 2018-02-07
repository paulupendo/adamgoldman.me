import axios from 'axios'

export default {
  getByName, getByToken,
}

const formId = 'aSV9Lc'
const apiKey = '6b62b6addd9d9c1b72e25804c350aeb6dd5b1a66'

function getByName(req, res) {
  axios.get(`https://api.typeform.com/v1/form/${formId}?key=${apiKey}`)
    .then((response) => {
      console.log(response.data, 'data')
    }).catch((e) => {
      console.log(e)
    })
  // const data = axios.get('https://api.typeform.com/v1/form/FS5ylM?key=6b62b6addd9d9c1b72e25804c350aeb6dd5b1a66')
  res.send(`your name is ${req.params.name}`)
}

function getByToken(req, res) {
  // const data = axios.get(`https://api.typeform.com/v1/form/${form_id}?key=${api_key}&token=${req.params.token}`)
  //   .then( response => {
  //     console.log(response.data,'data')
  //   }).catch( e => {
  //     console.log(e)
  //   })
  res.send(`token ${req.params.token}`)
}
