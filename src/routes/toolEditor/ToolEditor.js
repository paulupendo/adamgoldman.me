import React from 'react'
import PropTypes from 'prop-types'
import withStyles from 'isomorphic-style-loader/lib/withStyles'
import axios from 'axios'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faTrashAlt from '@fortawesome/fontawesome-free-regular/faTrashAlt'
import faSave from '@fortawesome/fontawesome-free-regular/faSave'
import faEye from '@fortawesome/fontawesome-free-solid/faEye'
import { Typeahead } from 'react-bootstrap-typeahead'

import { inputChange, inputToggle } from '../../forms'

import { freshStep } from './toolEditorUtils'
import Steps from './Steps'
import Toc from './Toc'
import s from './ToolEditor.css'

class ToolEditor extends React.Component {
  static propTypes = {
    data: PropTypes.any.isRequired,
    url: PropTypes.string.isRequired,
  }

  state = {
    isDraft: false,
    title: '',
    description: '',
    credits: '',
    steps: [freshStep()],
    hiddenFields: [],
  }

  componentWillMount() {
    if (this.props.data) {
      this.setState(this.props.data)
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.setupHotkeys, false)
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.setupHotkeys, false)
  }

  render() {
    return (
      <div style={{ padding: 10 }}>
        <div className="clearfix" style={{ width: '60%', float: 'left' }}>
          {this.renderDetails()}
          <hr />
          <h1 className="text-center">Steps</h1>
          <Steps steps={this.state.steps} onUpdateSteps={this.updateSteps} />
          <div className={s.controls}>
            <a className={s.control} href={`/tools/${this.props.url}`} target="_blank"><FontAwesomeIcon icon={faEye} /></a>
            <a className={s.control} onClick={this.save}><FontAwesomeIcon icon={faSave} /></a>
            <a className={s.control} onClick={this.del}><FontAwesomeIcon icon={faTrashAlt} /></a>
          </div>
        </div>
        <div className="clearfix" style={{ width: '35%', right: 0, position: 'fixed' }}>
          <Toc steps={this.state.steps} onReorderSteps={this.updateSteps} />
        </div>
      </div>
    )
  }

  renderDetails() {
    const {
      title, description, credits, isDraft,
    } = this.state
    return (
      <div>
        <h1 id="details" className="text-center">Details</h1>
        <div className="form-group">
          Title
          <input className="form-control" placeholder="Title" value={title} onChange={inputChange.call(this, 'title')} />
        </div>
        <div className="form-group">
          Description
          <div style={{ position: 'relative' }}>
            <input className="form-control" placeholder="Description" value={description} onChange={inputChange.call(this, 'description')} />
          </div>
        </div>
        <div className="form-group">
          Credits
          <input className="form-control" placeholder="Credits" value={credits} onChange={inputChange.call(this, 'credits')} />
        </div>
        <div className="form-group">
          <input style={{ marginRight: 10 }} type="checkbox" id="isDraft" value={isDraft} checked={isDraft} onChange={inputToggle.call(this, 'isDraft')} />
          <label htmlFor="isDraft">Draft</label>
        </div>
        <Typeahead
          allowNew
          multiple
          newSelectionPrefix="Add hidden field:"
          onChange={this.updateHiddenFields}
          defaultSelected={this.state.hiddenFields}
          options={this.state.hiddenFields}
          placeholder="Add hidden field"
        />
      </div>
    )
  }

  elems = {}

  save = () => {
    const state = { ...this.state, url: this.props.url }
    cleanEmptyValues(state)
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
    axios.delete(`/api/tools/${this.props.url}`)
      .then((res) => {
        global.console.log('deleted!', res.data)
        global.alert('deleted!')
      })
      .catch((err) => {
        global.console.error(err)
        global.alert(err.message)
      })
  }

  updateHiddenFields = (hiddenFields) => {
    // TODO :: if an existing field is changed or removed, check if it's used, and prompt warning
    this.setState({ hiddenFields })
  }

  setupHotkeys = (evt) => {
    if (evt.key === 'S' && evt.ctrlKey && evt.shiftKey) {
      this.save()
    }
  }

  focusNewStepTitle = (sIdx = this.state.steps.length - 1) => this.elems[`${sIdx}-title`].focus()

  updateSteps = (steps) => { this.setState({ steps }) }
}

export default withStyles(s)(ToolEditor)

function cleanEmptyValues(state) {
  // clear empty values
  state.steps = state.steps.map((step) => {
    if (!step.type.match(/radio|checkbox/)) {
      step.answers = []
      return step
    }
    step.answers = step.answers.map((a) => {
      if (!a.text) { delete a.text }
      if (!a.hasGoToStep) { delete a.hasGoToStep; delete a.goToStepByNum }
      if (!a.isLink) { delete a.isLink; delete a.link }
      if (!a.isLinkNew) { delete a.linkNew }
      return a
    })
    return step
  })
}
