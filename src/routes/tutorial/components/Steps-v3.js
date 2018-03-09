import React from 'react'
import PropTypes from 'prop-types'

import Markdown from '../../../components/Markdown'
import { scrollToElem, isMobile } from '../../../utils'

import AnswersV3 from './Answers-v3'

class StepsV3 extends React.Component {
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
  }

  render() {
    return (
      <div>
        {this.renderTitle()}
        {this.renderDescription()}
        {this.renderInput()}
        {this.renderAnswers()}
      </div>
    )
  }

  renderTitle() {
    const step = this.props.steps[this.state.currentStep]
    if (!step.title) { return null }
    return (
      <Markdown
        source={`## ${replaceVars(step.title, this.state)}`}
      />
    )
  }

  renderDescription() {
    const step = this.props.steps[this.state.currentStep]
    return (
      <Markdown
        source={replaceVars(step.description, this.state)}
      />
    )
  }

  renderInput() {
    const { inputId, inputPlaceholder } = this.props.steps[this.state.currentStep]
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
            autoFocus={!isMobile()}
            value={this.state[`${inputId}`]}
            onChange={this.inputsChange(inputId)}
            placeholder={replaceVars(inputPlaceholder, this.state)}
            required
            className="form-control"
            aria-describedby="inputHelp"
          />
          <small id="inputHelp" className="form-text text-muted">I will never share your data with anyone else.</small>
        </div>
        <button type="submit" className="btn btn-primary btn-block">Lets continue</button>
      </form>
    )
  }

  renderAnswers() {
    const answers = this.props.steps[this.state.currentStep].answers.map((answer) => {
      if (answer.text) {
        answer.text = replaceVars(answer.text, this.state)
      }
      return answer
    })
    return (
      <AnswersV3
        style={{ marginTop: 20, marginBottom: 20 }}
        gender={this.state.gender}
        answers={answers}
        onGoToStepByTitle={this.goToStepByTitle}
        onResetInputs={this.resetInputs}
        onSetInput={this.setInput}
        onNext={this.next}
        noBack={this.state.currentStep === 0}
      />
    )
  }

  back = n =>
    this.goToStep(this.state.currentStep - (typeof n === 'number' ? n : 1));
  next = n =>
    this.goToStep(this.state.currentStep + (typeof n === 'number' ? n : 1));

  goToStep = (step) => {
    scrollTop()
    this.setState({ currentStep: step })
  };

  goToStepByTitle = (title) => {
    const { steps } = this.props
    scrollTop()
    this.setState({
      currentStep: steps.indexOf(steps.find(s => s.title === title)),
    })
  };

  inputsChange = id => evt => this.setState({ [id]: evt.target.value })

  resetInputs = inputIdsToReset => inputIdsToReset.forEach(id => this.setState({ [id]: '' }))

  setInput = (id, value) => {
    this.setState({ [id]: value })
  }
}
export default StepsV3

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
