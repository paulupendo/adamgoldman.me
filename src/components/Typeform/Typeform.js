import React from 'react'
import { ReactTypeformEmbed } from 'react-typeform-embed'

class Typeform extends React.Component {
  state = {
    isMounted: false,
  }
  componentDidMount() {
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ isMounted: true })
  }
  componentWillUnmount() {
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ isMounted: false })
  }
  render() {
    if (!this.state.isMounted) {
      return null
    }
    return <ReactTypeformEmbed {...this.props} />
  }
}

export default Typeform
