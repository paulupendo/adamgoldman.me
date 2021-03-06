import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import withStyles from 'isomorphic-style-loader/lib/withStyles'
import faPaperPlane from '@fortawesome/fontawesome-free-regular/faPaperPlane'
import faLink from '@fortawesome/fontawesome-free-solid/faLink'
import faExternalLinkAlt from '@fortawesome/fontawesome-free-solid/faExternalLinkAlt'
import faExclamation from '@fortawesome/fontawesome-free-solid/faExclamation'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faTrashAlt from '@fortawesome/fontawesome-free-regular/faTrashAlt'
import _ from 'lodash'
import { pure } from 'recompose'

import { freshAnswer } from './toolEditorUtils'
import s from './ToolEditor.css'

const changeAnswerKey = (key, answers, aIdx, onUpdateStepAnswers) => (evt) => {
  answers = _.cloneDeep(answers)
  answers[aIdx][key] = evt.target.value
  onUpdateStepAnswers(answers)
}

const toggleAnswerOption = (key, answers, aIdx, onUpdateStepAnswers) => () => {
  answers = _.cloneDeep(answers)
  answers[aIdx][key] = !answers[aIdx][key]
  onUpdateStepAnswers(answers)
}

const addAnswer = (answers, onUpdateStepAnswers) => () => {
  onUpdateStepAnswers(answers.concat(freshAnswer()))
}

const removeAnswer = (answers, aIdx, onUpdateStepAnswers) => () => {
  if (!global.confirm('remove answer?')) {
    return
  }
  answers = _.cloneDeep(answers)
  answers.splice(aIdx, 1)
  onUpdateStepAnswers(answers)
}

const answerKeyPress = (answers, aIdx, onUpdateStepAnswers) => (evt) => {
  if (evt.key !== 'Enter') {
    return
  }
  evt.preventDefault()
  answers = _.cloneDeep(answers)
  answers.splice(aIdx + 1, 0, freshAnswer())
  onUpdateStepAnswers(answers)
}

const setAnswersTemplate = onUpdateStepAnswers => () => {
  if (!global.confirm('set answers template?')) {
    return
  }
  const answers = [
    freshAnswer({ text: 'I feel MUCH better' }),
    freshAnswer({ text: 'I feel better' }),
    freshAnswer({ text: 'I don’t feel a change in this step' }),
    freshAnswer({ text: 'I feel worse', isConcern: true, concern: 'feel worse' }),
  ]
  onUpdateStepAnswers(answers)
}

const hasOtherAnswer = answers => !!answers.find(a => a.isOther)

const toggleHasOtherAnswer = (answers, onUpdateStepAnswers) => () => {
  answers = _.cloneDeep(answers)
  hasOtherAnswer(answers) // eslint-disable-line no-unused-expressions
    ? answers.pop()
    : answers.push(freshAnswer({ isOther: true, text: 'Other', isReadOnly: true }))
  onUpdateStepAnswers(answers)
}

const Answers = ({
  type, answers, sIdx, onUpdateStepAnswers,
}) => {
  const elems = {}
  if (!type) {
    return null
  }
  if (!type.match(/radio|checkbox/)) {
    return null
  }
  return (
    <div>
      {answers.map((a, aIdx) => (
        <div>
          <div className={cx('row', s.answer)}>
            <div className="col-10">
              <input
                onKeyPress={answerKeyPress(answers, aIdx, onUpdateStepAnswers)}
                ref={(el) => { elems[`answer-${aIdx}`] = el }}
                className="btn btn-primary btn-block text-left"
                placeholder={`answer #${aIdx}`}
                value={a.text}
                onChange={changeAnswerKey('text', answers, aIdx, onUpdateStepAnswers)}
                readOnly={a.isReadOnly}
              />
            </div>
            <div className={cx('col-2 text-right', s.answerActions)}>
              <FontAwesomeIcon
                onClick={removeAnswer(answers, aIdx, onUpdateStepAnswers)}
                icon={faTrashAlt}
              />
            </div>
            <div className={cx('col-10', s.answerOptionCol, { [s.isVisible]: a.hasGoToStep || a.isLink || a.isLinkNew || a.isConcern })}>
              {[{ toggleId: 'hasGoToStep', icon: faPaperPlane, fieldId: 'goToStepByNum' }, { toggleId: 'isLink', icon: faLink, fieldId: 'link' }, { toggleId: 'isLinkNew', icon: faExternalLinkAlt, fieldId: 'linkNew' }, { toggleId: 'isConcern', icon: faExclamation, fieldId: 'concern' }]
            .map(({ toggleId, icon, fieldId }) => (
              <div className={s.answerOption}>
                <div
                  className={s.answerOptionToggle}
                  onClick={toggleAnswerOption(toggleId, answers, aIdx, onUpdateStepAnswers)}
                >
                  <FontAwesomeIcon icon={icon} />
                </div>
                <input
                  type="text"
                  className={cx(s.answerOptionField, { [s.isVisible]: a[toggleId] })}
                  id={fieldId}
                  placeholder={fieldId}
                  value={a[fieldId]}
                  onChange={changeAnswerKey(fieldId, aIdx, onUpdateStepAnswers)}
                />
              </div>
            ))}
            </div>
          </div>
        </div>
        ))}
      <div className={cx('col-10', s.stepRevealable)} style={{ display: 'flex', justifyContent: 'space-between', marginTop: 15 }}>
        <div className="form-check">
          <input type="checkbox" className="form-check-input" id={`step-${sIdx}-other-toggle`} checked={hasOtherAnswer(answers)} onChange={toggleHasOtherAnswer(answers, onUpdateStepAnswers)} />
          <label className="form-check-label" htmlFor={`step-${sIdx}-other-toggle`}>Other</label>
        </div>
        <a onClick={setAnswersTemplate(onUpdateStepAnswers)}>Template A</a>
        <a onClick={addAnswer(answers, onUpdateStepAnswers)}>+ answer</a>
      </div>
    </div>
  )
}

Answers.propTypes = {
  type: PropTypes.string.isRequired,
  answers: PropTypes.array.isRequired,
  sIdx: PropTypes.number.isRequired,
  onUpdateStepAnswers: PropTypes.func.isRequired,
}

export default withStyles(s)(pure(Answers))
