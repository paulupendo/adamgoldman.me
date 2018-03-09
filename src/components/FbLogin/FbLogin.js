// @flow

import React from 'react'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faFacebookF from '@fortawesome/fontawesome-free-brands/faFacebookF'
import axios from 'axios'

type Props = {
  onLogin: Function,
  onLogout: Function,
  user: Object,
}

class FbLogin extends React.Component {
  props: Props

  render() {
    const { user, onLogout } = this.props
    if (user._id) {
      return <a onClick={onLogout}>Logout</a>
    }
    return (
      <div onClick={this.login} style={{ cursor: 'pointer' }}>
        <FontAwesomeIcon icon={faFacebookF} /> Login
      </div>
    )
  }

  login = () => {
    global.FB.login(this.responseFacebook, { scope: 'email,public_profile' })
  }

  responseFacebook = (response) => {
    if (response.picture && response.picture.data && response.picture.data.url) {
      response.fbPictureUrl = response.picture.data.url
    }
    axios.post('/api/users/fbAuth', response)
      .then((serverRes) => {
        global.console.log('serverRes', serverRes)
        this.props.onLogin(serverRes.data)
      })
      .catch((err) => {
        global.console.error(err)
        global.alert('there was an error, please contact me')
      })
  }
}

export default FbLogin
