// @flow

import React from 'react'

import Link from '../../../components/Link'
import FbShareLink from '../../../components/FbShareLink'

type Props = {
  style: Object,
  answers?: Array<any>,
  onNext: Function,
  onGoToStepByTitle: Function,
  noBack: boolean,
  onResetInputs: Function,
  onSetInput: Function,
};

const AnswersV3 = ({
  style, answers, onNext, onGoToStepByTitle, noBack, onResetInputs, onSetInput,
}:
Props) => (
  <div style={style}>
    {answers.map((answer, idx) => {
      let html
      if (answer.isFbShare) {
        html = <FbShareLink>I want more to experience this</FbShareLink>
      } else if (answer.link) {
        html = <Link to={answer.link}>{answer.text}</Link>
      } else if (answer.alert) {
        html = <button className="btn btn-primary" onClick={() => global.alert(answer.alert)}>{answer.text}</button>
      } else if (answer.linkNew) {
        html = (
          <a
            className="btn btn-primary"
            href={answer.linkNew}
            target="_blank"
            rel="nofollow noreferrer noopener"
          >{answer.text}
          </a>
        )
      } else {
        html = (
          <button
            className="btn btn-primary"
            onClick={() => {
            if (answer.resetInputs) {
              onResetInputs(answer.resetInputs.split(', '))
            }
            if (answer.inputId) {
              onSetInput(answer.inputId, answer.inputValue)
            }
            if (answer.goToStepByTitle) {
              onGoToStepByTitle(answer.goToStepByTitle)
            } else {
              onNext()
            }
          }}
          >{answer.text}
          </button>
        )
      }

      return (
        <div key={idx} className="tool-answer">
          {html}
        </div>
      )
    })}
    <hr />
    {renderBack({ noBack, onNext })}
  </div>
)

AnswersV3.defaultProps = {
  answers: [],
}

// eslint-disable-next-line react/prop-types
function renderBack({ noBack, onNext }) {
  if (noBack) {
    return null
  }
  return (
    <div className="tool-answer">
      <button className="btn btn-secondary" onClick={() => onNext(-1)}>Back</button>
    </div>
  )
}

export default AnswersV3
