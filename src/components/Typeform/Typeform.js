import React from 'react'
import { ReactTypeformEmbed } from 'react-typeform-embed'

import Ssr from '../../componentsHOC/Ssr'

export default Ssr(props => <ReactTypeformEmbed {...props} />)
