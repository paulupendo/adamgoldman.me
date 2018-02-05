import React from 'react'

import TypeForm from './typeForm'

function action() {
  return {
    title: 'Embeded TypeForm Test',
    chunks: ['typeForm'],
    path: '/typeForm',
    component: <TypeForm />,
  }
}

export default action
