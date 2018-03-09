import React from 'react'
import PropTypes from 'prop-types'
import withStyles from 'isomorphic-style-loader/lib/withStyles'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import axios from 'axios'
import FA from 'react-fontawesome'

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
    steps: [],
  }

  componentWillMount() {
    if (this.props.data) {
      this.setState(this.props.data)
    }
  }

  render() {
    return (
      <div>
        <div className="clearfix" style={{ width: '60%', float: 'left' }}>
          {this.renderDetails()}
          <hr />
          {this.renderSteps()}
          <a onClick={this.addStep}>+ Step</a>
          <div className={s.controls}>
            <a className={s.control} onClick={this.save}>Save</a>
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
          <input type="checkbox" id="isDraft" value={isDraft} checked={isDraft} onChange={inputToggle.call(this, 'isDraft')} />
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
                {this.state.steps.map(({ title }, idx) => (
                  <Draggable key={idx} draggableId={idx}>
                    {(providedInner, snapshotInner) => (
                      <div>
                        <div
                          key={idx}
                          ref={providedInner.innerRef}
                          style={getItemStyle(
                            providedInner.draggableStyle,
                            snapshotInner.isDragging,
                          )}
                          {...providedInner.dragHandleProps}
                        >
                          <a onClick={() => scrollToElem(document.querySelector('html'), document.querySelector(`#step-${idx}`).getBoundingClientRect().top - document.body.getBoundingClientRect().top, 300)}>Step {(idx <= 9 && stepsCount > 9) ? `0${idx}` : idx}/{stepsCount}</a> - {title}
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
            <input style={{ width: '100%', border: 0 }} className="h1" id={`step-${sIdx}-title`} placeholder="Title" value={step.title} onChange={this.changeStepKey('title', sIdx)} />
            <textarea style={{ minHeight: 200, width: '100%', border: 0 }} id={`step-${sIdx}-description`} required className="form-control" placeholder="Description" value={step.description} onChange={this.changeStepKey('description', sIdx)} />
          </div>
          <div className="col-2">
            <p className="text-right">{sIdx}/{this.state.steps.length}</p>
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
            <a onClick={this.removeStep(sIdx)}><FA name="trash-o" /></a>
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
        <a onClick={this.addAnswer(sIdx)}>+ answer</a>
        {step.answers.map((a, aIdx) => (
          <div style={{ marginLeft: 10 }}>
            <div className="form-row">
              <div className="col-auto">
                <label htmlFor={`step-${sIdx}-answer-${aIdx}`} className="col-form-label"><strong>Answer {aIdx}</strong></label>
              </div>
              <div className="col-8">
                <input id={`step-${sIdx}-answer-${aIdx}`} className="form-control" placeholder={`answer #${aIdx}`} value={a.text} onChange={this.changeAnswerKey('text', sIdx, aIdx)} />
              </div>
              <div className="col-auto">
                <a onClick={this.removeAnswer(sIdx, aIdx)}><FA name="trash-o" /></a>
              </div>
            </div>
            {[{ id: 'hasGoToStep', text: '--> Step' }, { id: 'isSetInput', text: 'Sets Input' }, { id: 'hasResetInputs', text: 'Resets Input' }, { id: 'isLink', text: 'Link' }, { id: 'isLinkNew', text: 'Link (new window)' }]
              .map(({ id, text }) => (
                <div className="form-check form-check-inline">
                  <label htmlFor={`step-${sIdx}-answer-${aIdx}-${id}`} className="form-check-label">
                    <input type="checkbox" className="form-check-input" id={`step-${sIdx}-answer-${aIdx}-${id}`} value={a[id]} checked={a[id]} onChange={this.toggleAnswerKey(id, sIdx, aIdx)} />
                    {text}
                  </label>
                </div>
                ))}
            <div className="form-group">
              { a.isSetInput && <input placeholder="id" value={a.inputId} onChange={this.changeAnswerKey('inputId', sIdx, aIdx)} /> }
              { a.isSetInput && <input placeholder="value" value={a.inputValue} onChange={this.changeAnswerKey('inputValue', sIdx, aIdx)} /> }
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
            { step.answers.length - 1 > aIdx && <hr className={s.answersHr} />}
          </div>
          ))}
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

  removeStep = idx => () => {
    const nextSteps = [...this.state.steps]
    nextSteps.splice(idx, 1)
    this.setState({ steps: nextSteps })
  }

  addStep = () => {
    const nextSteps = [...this.state.steps]
    nextSteps.push({
      title: '',
      description: '',
      type: 'radio',
      inputId: '',
      inputPlaceholder: '',
      answers: [],
    })
    this.setState({ steps: nextSteps })
  }

  changeStepKey = (key, idx) => (evt) => {
    const nextSteps = [...this.state.steps]
    nextSteps[idx][key] = evt.target.value
    this.setState({ steps: nextSteps })
  }

  toggleStepKey = (key, idx) => () => {
    const nextSteps = [...this.state.steps]
    nextSteps[idx][key] = !nextSteps[idx][key]
    this.setState({ steps: nextSteps })
  }

  changeAnswerKey = (key, idx, aIdx) => (evt) => {
    const nextSteps = [...this.state.steps]
    nextSteps[idx].answers[aIdx][key] = evt.target.value
    this.setState({ steps: nextSteps })
  }

  toggleAnswerKey = (key, idx, aIdx) => () => {
    const nextSteps = [...this.state.steps]
    nextSteps[idx].answers[aIdx][key] = !nextSteps[idx].answers[aIdx][key]
    this.setState({ steps: nextSteps })
  }

  addAnswer = idx => () => {
    const nextSteps = [...this.state.steps]
    nextSteps[idx].answers.push({
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
    })
    this.setState({ steps: nextSteps })
  }

  removeAnswer = (idx, aIdx) => () => {
    const nextSteps = [...this.state.steps]
    nextSteps[idx].answers.splice(aIdx, 1)
    this.setState({ steps: nextSteps })
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
