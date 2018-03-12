import React from 'react'
import PropTypes from 'prop-types'

import Markdown from '../../../components/Markdown'
import { scrollToElem } from '../../../utils'

import AnswersV4 from './Answers-v4'

class StepsV4 extends React.Component {
  static propTypes = {
    initialState: PropTypes.object,
    steps: PropTypes.array.isRequired,
  }

  static defaultProps = {
    initialState: {},
  }

  state = {
    ...this.props.initialState,
    currentStep: 0,
    answerByStep: {},
  }

  render() {
    return (
      <div>
        {this.renderTitle()}
        {this.renderDescription()}
        {this.renderInput()}
        {this.renderAnswers()}
        {this.renderBack()}
      </div>
    )
  }

  renderTitle() {
    const { title } = this.currentStep()
    if (!title) { return null }
    return <Markdown source={`## ${replaceVars(title, this.state)}`} />
  }

  renderDescription() {
    return <Markdown source={replaceVars(this.currentStep().description, this.state)} />
  }

  renderInput() {
    const { inputId, inputPlaceholder } = this.currentStep()
    if (!inputId) {
      return null
    }
    return (
      <form onSubmit={(evt) => {
        evt.preventDefault()
        this.next()
      }}
      >
        <div className="form-group">
          <input
            value={this.state.answerByStep[this.state.currentStep]}
            onChange={this.stepInputChange}
            placeholder={replaceVars(inputPlaceholder, this.state)}
            required
            className="form-control"
            aria-describedby="inputHelp"
          />
          <small id="inputHelp" className="form-text text-muted">I will never share your data with anyone else.</small>
        </div>
        <button type="submit" className="btn btn-primary">Let&apos;s</button>
      </form>
    )
  }

  renderAnswers() {
    const answers = this.currentStep().answers.map((answer) => {
      if (answer.text) { answer.text = replaceVars(answer.text, this.state) }
      return answer
    })
    return (
      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <AnswersV4
          answers={answers}
          onSubmit={this.submitMultipleChoiceAnswer}
        />
      </div>
    )
  }

  renderBack() {
    return this.state.currentStep === 0 ? null : <a onClick={this.back}>Back</a>
  }

  submitMultipleChoiceAnswer = (aIdx) => {
    global.console.log('submitted answer ', aIdx)
  }

  back = () => this.goToStep(this.state.currentStep - 1)
  next = () => this.goToStep(this.state.currentStep + 1)

  goToStep = (step) => {
    // @TODO
    // if (step < this.state.currentStep) {
    //  reset chosen answers of all steps in between
    // }
    this.setState({ currentStep: step })
    scrollTop()
  }

  stepInputChange = (evt) => {
    const answerByStep = { ...this.state.answerByStep }
    answerByStep[this.state.currentStep] = evt.target.value
    this.setState({ answerByStep })
  }

  currentStep() {
    return this.props.steps[this.state.currentStep]
  }
}
export default StepsV4

// @TODO :: use new var system
function replaceVars(str, state) {
  return str.replace(/\${(.*?)}/g, (...args) => {
    const key = args[1]
    if (key.indexOf('heShe') === 0) {
      const genderKey = key.replace('heShe(', '').replace(')', '')
      return state[genderKey] === 'male' ? 'he' : 'she'
    }
    if (key.indexOf('hisHer') === 0) {
      const genderKey = key.replace('hisHer(', '').replace(')', '')
      return state[genderKey] === 'male' ? 'his' : 'her'
    }
    if (key.indexOf('himHer') === 0) {
      const genderKey = key.replace('himHer(', '').replace(')', '')
      return state[genderKey] === 'male' ? 'him' : 'her'
    }
    return state[key]
  })
}

function scrollTop() {
  return scrollToElem(document.querySelector('html'), 0, 300)
}
