// @flow

import React from 'react'

import Link from '../../../components/Link'
import ExternalA from '../../../components/ExternalA'

type Props = {
  answers: Array<any>,
  onSubmit: Function,
};

const AnswersV4 = ({ answers, onSubmit }: Props) => (
  <div>
    {answers.map((answer, idx) => {
      let html
      if (answer.link) {
        html = <Link to={answer.link}>{answer.text}</Link>
      } else if (answer.linkNew) {
        html = <ExternalA href={answer.linkNew}>{answer.text}</ExternalA>
      } else {
        // @ TODO :: Handle "other"
        html = (
          <a onClick={onSubmit}>{answer.text}</a>
        )
      }

      return (
        <div key={idx}>{html}</div>
      )
    })}
  </div>
)

export default AnswersV4
