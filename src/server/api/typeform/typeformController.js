import axios from 'axios'

export default {
  getDummy, postDummy,
}

const url = 'https://api.typeform.com/v1/form/'
const form_id = 'FS5ylM'

function getDummy(req, res) {
  // axios.get('https://api.typeform.com/v1/form/FS5ylM?key=6b62b6addd9d9c1b72e25804c350aeb6dd5b1a66&token=6f93266f4b364a2a891a23aca09b2c2c')
  // .then(data => {
  // 	console.log(data,'data')
  // 	res.send(data)
  // })

  res.send(`your name is ${req.params.name}`)
}

function postDummy(req, res) {

}
