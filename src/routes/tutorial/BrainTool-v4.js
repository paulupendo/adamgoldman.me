// @flow

import React from 'react'

import Share from '../../components/Share'

import StepsV4 from './components/Steps-v4'

type Props = {
  tool: Object,
  path: string,
};

const BrainToolV3 = ({ tool, path }: Props) => (
  <div>
    <div className="container">
      <div className="row">
        <div className="col-md-2 col-xs-12">
          <Share path={path} title={tool.title} />
        </div>
        <div className="col-md-8 col-xs-12">
          <div className="mainheading">
            <h1 className={`posttitle ${!tool.isRtl ? '' : 'rtl'}`}>{tool.title}</h1>
          </div>
          <div className="article-post">
            <StepsV4 {...tool} />
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default BrainToolV3
