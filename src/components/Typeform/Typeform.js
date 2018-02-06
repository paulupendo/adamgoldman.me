import React from 'react'

class Typeform extends React.Component {
  componentDidMount() {
    /* eslint-disable */
    let qs, js, q, s, d = document, gi = d.getElementById, ce = d.createElement, gt = d.getElementsByTagName, id = 'typef_orm', b = 'https://embed.typeform.com/';
    if (!gi.call(d, id)) { js = ce.call(d, 'script'); js.id = id; js.src = `${b}embed.js`; q = gt.call(d, 'script')[0]; q.parentNode.insertBefore(js, q) }
    /* eslint-enable */
  }

  render() {
    return (
      <div
        className="typeform-widget"
        {...this.props}
      />
    )
  }
}


export default Typeform
