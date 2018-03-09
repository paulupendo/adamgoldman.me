import React from 'react'
import axios from 'axios'

import Layout from '../../components/Layout'

// import BrainToolV1 from './BrainTool-v1'
import BrainToolV3 from './BrainTool-v3'

// const toolsV1 = [
//   'smoking-destroyer',
//   'nail-biting-destroyer',
//   'trauma-relief',
//   'internal-dialog-scrambeler',
//   'loved-one-amplifier',
//   'reverse-feeling-spin',
//   'reverse-feeling-spin2',
// ]

// const toolsV3 = [
//   'feel-good-generator',
//   'perfect-day',
//   'recurring-time-distortion',
//   'grief-to-appreciation',
// ]

async function action({ params }) {
  const path = `/tools/${params.tool}`
  const { data } = await axios.get(`/api/tools/${params.tool}`)
  return {
    title: data.title,
    description: data.description,
    path,
    component: (
      <Layout path={path}>
        <BrainToolV3 tool={data} path={path} />
      </Layout>
    ),
  }
}

export default action
