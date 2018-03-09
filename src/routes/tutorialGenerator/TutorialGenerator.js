import React from 'react'
import PropTypes from 'prop-types'
import withStyles from 'isomorphic-style-loader/lib/withStyles'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import axios from 'axios'
import FA from 'react-fontawesome'
import cx from 'classnames'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faKeyboard from '@fortawesome/fontawesome-free-solid/faKeyboard'

import { inputChange, inputToggle } from '../../forms'
import { reorder, scrollToElem } from '../../utils'

import s from './TutorialGenerator.css'

class TutorialGenerator extends React.Component {
  static propTypes = {
    data: PropTypes.any.isRequired,
    url: PropTypes.string.isRequired,
  }

  state = {
    initialState: {},
    isDraft: false,
    title: '',
    description: '',
    nick: '',
    credits: '',
    steps: [stepInitialState()],
  }

  componentWillMount() {
    if (this.props.data) {
      this.setState(this.props.data)
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.onKeyDown)
  }

  componentWillUnmount() {
    window.addEventListener('keydown', this.onKeyDown)
  }

  render() {
    return (
      <div style={{ padding: 10 }}>
        <div className="clearfix" style={{ width: '60%', float: 'left' }}>
          {this.renderDetails()}
          <hr />
          {this.renderSteps()}
          <a onClick={this.addStep}>+ Step</a>
          <div className={s.controls}>
            <a className={s.control} href={`/tools/${this.props.url}`} target="_blank"><FA name="eye" /></a>
            <a className={s.control} onClick={this.save}><FA name="save" /></a>
            <a className={s.control} onClick={this.del}><FA name="trash" /></a>
          </div>
        </div>
        <div className="clearfix" style={{ width: '35%', right: 0, position: 'fixed' }}>
          {this.renderTOC()}
        </div>
      </div>
    )
  }

  renderDetails() {
    const {
      title, nick, description, credits, isDraft,
    } = this.state
    return (
      <div>
        <h2 id="details">Details</h2>
        <div className="form-group">
          Title
          <input className="form-control" placeholder="Title" value={title} onChange={inputChange.call(this, 'title')} />
        </div>
        <div className="form-group">
          Nick
          <input className="form-control" placeholder="Nick" value={nick} onChange={inputChange.call(this, 'nick')} />
        </div>
        <div className="form-group">
          Description
          <input className="form-control" placeholder="Description" value={description} onChange={inputChange.call(this, 'description')} />
        </div>
        <div className="form-group">
          Credits
          <input className="form-control" placeholder="Credits" value={credits} onChange={inputChange.call(this, 'credits')} />
        </div>
        <div className="form-group">
          <input style={{ marginRight: 10 }} type="checkbox" id="isDraft" value={isDraft} checked={isDraft} onChange={inputToggle.call(this, 'isDraft')} />
          <label htmlFor="isDraft">Draft</label>
        </div>
      </div>
    )
  }

  renderTOC() {
    const stepsCount = this.state.steps.length - 1
    return (
      <div>
        <h2>TOC</h2>
        <a onClick={() => scrollToElem(document.querySelector('html'), 0, 300)}>Details</a>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDraggingOver)}
              >
                {this.state.steps.map(({ title }, sIdx) => (
                  <Draggable key={sIdx} draggableId={sIdx}>
                    {(providedInner, snapshotInner) => (
                      <div>
                        <div
                          key={sIdx}
                          ref={providedInner.innerRef}
                          style={getItemStyle(
                            providedInner.draggableStyle,
                            snapshotInner.isDragging,
                          )}
                          {...providedInner.dragHandleProps}
                        >
                          <a onClick={() => scrollToElem(document.querySelector('html'), document.querySelector(`#step-${sIdx}`).getBoundingClientRect().top - document.body.getBoundingClientRect().top, 300)}>Step {(sIdx <= 9 && stepsCount > 9) ? `0${sIdx}` : sIdx}/{stepsCount}</a> - {title}
                        </div>
                        {providedInner.placeholder}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    )
  }

  renderSteps() {
    return this.state.steps.map((step, sIdx) => (
      <div key={sIdx} id={`step-${sIdx}`}>
        <div className="row">
          <div className="col-10">
            <input style={{ width: '100%', border: 0 }} className="h2" id={`step-${sIdx}-title`} placeholder="Step title" value={step.title} onChange={this.changeStepKey('title', sIdx)} />
            <textarea style={{ minHeight: 200, width: '100%', border: 0 }} id={`step-${sIdx}-description`} required className="form-control" placeholder="Step description" value={step.description} onChange={this.changeStepKey('description', sIdx)} />
          </div>
          <div className="col-2">
            <p className="text-right">{sIdx}/{this.state.steps.length - 1} <a onClick={this.removeStep(sIdx)}><FA name="trash-o" /></a></p>
            <select
              className="select"
              style={{ marginRight: 5 }}
              value={step.type}
              onChange={this.changeStepKey('type', sIdx)}
              required
            >
              <option value="radio">Radio</option>
              <option value="checkbox">Checkbox</option>
              <option value="short">Short</option>
              <option value="long">Long</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          {step.type === 'short' && (
            <input className="form-control" value={step.inputPlaceholder} placeholder="Placeholder" onChange={this.changeStepKey('inputPlaceholder', sIdx)} />
            )}
          {step.type === 'long' && (
          <textarea className="form-control" value={step.inputPlaceholder} placeholder="Placeholder" onChange={this.changeStepKey('inputPlaceholder', sIdx)} />
            )}
        </div>

        {this.renderMultipleAnswers(sIdx)}

        <hr style={{ borderTopWidth: 10, marginBottom: 40 }} />
      </div>
    ),
    )
  }

  renderMultipleAnswers(sIdx) {
    const step = this.state.steps[sIdx]
    if (!step.type) {
      return null
    }
    if (!step.type.match(/radio|checkbox/)) {
      return null
    }
    return (
      <div>
        {step.answers.map((a, aIdx) => (
          <div>
            <div className={cx('row', s.answer)}>
              <div className="col-10">
                <input
                  onKeyPress={(evt) => { this.answerKeyPress(evt, sIdx, aIdx) }}
                  ref={(el) => { this[`step-${sIdx}-answer-${aIdx}`] = el }}
                  className="btn btn-primary btn-block text-left"
                  placeholder={`answer #${aIdx}`}
                  value={a.text}
                  onChange={this.changeAnswerKey('text', sIdx, aIdx)}
                />
              </div>
              <div className={cx('col-2 text-right', s.answerActions)}>
                <FA onClick={this.toggleAnswerSettings(sIdx, aIdx)} name="cog" className={cx(s.answerSettingsToggle, { [s.isActive]: a.showSettings })} />
                <FA onClick={this.removeAnswer(sIdx, aIdx)} name="trash-o" />
              </div>
            </div>
            {a.showSettings && [{ id: 'hasGoToStep', icon: 'paper-plane' }, { id: 'isSetInput', icon: faKeyboard }, { id: 'hasResetInputs', icon: 'eraser' }, { id: 'isLink', icon: 'Link' }, { id: 'link', icon: 'external-link' }]
              .map(({ id, icon }) => (
                <div className="form-check form-check-inline">
                  <label htmlFor={`step-${sIdx}-answer-${aIdx}-${id}`} className="form-check-label">
                    <input type="checkbox" className="form-check-input" id={`step-${sIdx}-answer-${aIdx}-${id}`} value={a[id]} checked={a[id]} onChange={this.toggleAnswerKey(id, sIdx, aIdx)} />
                    <FontAwesomeIcon icon={icon} />
                  </label>
                </div>
                ))}
            <div className="form-group">
              { a.isSetInput && <input placeholder="Input id" value={a.inputId} onChange={this.changeAnswerKey('inputId', sIdx, aIdx)} /> }
              { a.isSetInput && <input placeholder="Input value" value={a.inputValue} onChange={this.changeAnswerKey('inputValue', sIdx, aIdx)} /> }
            </div>
            <div className="form-group">
              { a.hasGoToStep && <input placeholder="title" value={a.goToStepByTitle} onChange={this.changeAnswerKey('goToStepByTitle', sIdx, aIdx)} /> }
            </div>
            <div className="form-group">
              { a.hasResetInputs && <input placeholder="Inputs to reset" value={a.resetInputs} onChange={this.changeAnswerKey('resetInputs', sIdx, aIdx)} /> }
            </div>
            <div className="form-group">
              { a.hasAlert && <input placeholder="Alert message" value={a.alert} onChange={this.changeAnswerKey('alert', sIdx, aIdx)} /> }
            </div>
            <div className="form-group">
              { a.isLink && <input placeholder="path" value={a.link} onChange={this.changeAnswerKey('link', sIdx, aIdx)} /> }
            </div>
            <div className="form-group">
              { a.isLinkNew && <input placeholder="path" value={a.linkNew} onChange={this.changeAnswerKey('linkNew', sIdx, aIdx)} /> }
            </div>
          </div>
          ))}
        <a onClick={this.addAnswer(sIdx)}>+ answer</a>
      </div>
    )
  }

  onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return
    }

    const steps = reorder(
      this.state.steps,
      result.source.index,
      result.destination.index,
    )

    this.setState({
      steps,
    })
  }

  removeStep = sIdx => () => {
    const nextSteps = [...this.state.steps]
    nextSteps.splice(sIdx, 1)
    this.setState({ steps: nextSteps })
  }

  addStep = () => {
    const nextSteps = [...this.state.steps]
    nextSteps.push(stepInitialState())
    this.setState({ steps: nextSteps })
  }

  changeStepKey = (key, sIdx) => (evt) => {
    const nextSteps = [...this.state.steps]
    nextSteps[sIdx][key] = evt.target.value
    this.setState({ steps: nextSteps })
  }

  toggleStepKey = (key, sIdx) => () => {
    const nextSteps = [...this.state.steps]
    nextSteps[sIdx][key] = !nextSteps[sIdx][key]
    this.setState({ steps: nextSteps })
  }

  changeAnswerKey = (key, sIdx, aIdx) => (evt) => {
    const nextSteps = [...this.state.steps]
    nextSteps[sIdx].answers[aIdx][key] = evt.target.value
    this.setState({ steps: nextSteps })
  }

  toggleAnswerKey = (key, sIdx, aIdx) => () => {
    const nextSteps = [...this.state.steps]
    nextSteps[sIdx].answers[aIdx][key] = !nextSteps[sIdx].answers[aIdx][key]
    this.setState({ steps: nextSteps })
  }

  addAnswer = sIdx => () => {
    const nextSteps = [...this.state.steps]
    nextSteps[sIdx].answers.push(answerInitialState())
    this.setState({ steps: nextSteps })
  }

  removeAnswer = (sIdx, aIdx) => () => {
    const nextSteps = [...this.state.steps]
    nextSteps[sIdx].answers.splice(aIdx, 1)
    this.setState({ steps: nextSteps })
  }

  toggleAnswerSettings = (sIdx, aIdx) => () => {
    const nextSteps = [...this.state.steps]
    nextSteps[sIdx].answers[aIdx].showSettings = !nextSteps[sIdx].answers[aIdx].showSettings
    this.setState({ steps: nextSteps })
  }

  answerKeyPress = (evt, sIdx, aIdx) => {
    if (evt.key !== 'Enter') {
      return
    }
    const nextSteps = [...this.state.steps]
    nextSteps[sIdx].answers.splice(aIdx + 1, 0, answerInitialState())
    evt.preventDefault()
    this.setState({ steps: nextSteps }, () => this[`step-${sIdx}-answer-${aIdx + 1}`].focus())
  }

  save = () => {
    const state = { ...this.state }
    state.url = this.props.url
    cleanEmptyValues(state)
    addInputsToInitialState(state)
    axios.post('/api/tools/', state)
      .then((res) => {
        global.console.log('saved!', res.data)
        global.alert('saved!')
      })
      .catch((err) => {
        global.console.error(err)
        global.alert(err.message)
      })
  }

  del = () => {
    if (!global.confirm('Sure you want to delete this tool?')) {
      return
    }
    axios.post('/api/tools/', { url: this.props.url })
      .then((res) => {
        global.console.log('deleted!', res.data)
        global.alert('deleted!')
      })
      .catch((err) => {
        global.console.error(err)
        global.alert(err.message)
      })
  }
  onKeyDown = () => {
    // if (evt.srcElement.getAttribute('data-answer')) {
    //   this.addAnswerToStep(evt.srcElement)
    //   return
    // }
    // console.log(evt)
    // console.log(evt.key)
  }
}

export default withStyles(s)(TutorialGenerator)

function cleanEmptyValues(state) {
  // clear empty values
  state.steps = state.steps.map((step) => {
    step.answers = step.answers.map((a) => {
      if (!a.text) { delete a.text }
      if (!a.isSetInput) { delete a.isSetInput }
      if (!a.inputId) { delete a.inputId }
      if (!a.inputValue) { delete a.inputValue }
      if (!a.hasResetInputs) { delete a.hasResetInputs }
      if (!a.resetInputs) { delete a.resetInputs }
      if (!a.hasGoToStep) { delete a.hasGoToStep }
      if (!a.goToStepByTitle) { delete a.goToStepByTitle }
      if (!a.isFbShare) { delete a.isFbShare }
      if (!a.isLink) { delete a.isLink }
      if (!a.link) { delete a.link }
      return a
    })
    return step
  })
}

function addInputsToInitialState(state) {
  state.steps.filter(step => step.inputId).forEach((step) => { state.initialState[step.inputId] = '' })
}

const grid = 2

function getItemStyle(draggableStyle, isDragging) {
  return {
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,
    // change background colour if dragging
    background: isDragging ? 'lightgreen' : '',
    border: '1px solid #000',
    // styles we need to apply on draggables
    ...draggableStyle,
  }
}

function getListStyle(isDraggingOver) {
  return {
    background: isDraggingOver ? 'lightblue' : 'lightgrey',
    padding: grid,
  }
}

function stepInitialState() {
  return {
    title: '',
    description: '',
    type: 'radio',
    inputId: '',
    inputPlaceholder: '',
    answers: [answerInitialState()],
  }
}

function answerInitialState() {
  return {
    showSettings: false,
    text: '',
    alert: '',
    hasAlert: false,
    isSetInput: false,
    inputId: '',
    inputValue: '',
    hasResetInputs: '',
    resetInputs: '',
    hasGoToStep: false,
    goToStepByTitle: '',
    isFbShare: false,
    isLink: false,
    link: '',
    isLinkNew: false,
    linkNew: '',
  }
}
