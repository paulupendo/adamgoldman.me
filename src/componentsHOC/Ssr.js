import React from 'react'

const Ssr = Component => class SsrComponent extends React.Component {
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
    return <Component {...this.props} />
  }
}

export default Ssr
