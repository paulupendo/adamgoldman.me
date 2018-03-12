// @flow

import React from 'react'

import InputTrigger from '../../components/InputTrigger'

type Props = {
  value: String,
  placeHolder: String,
  type: String,
  isrequired: boolean,
  className: String,
  style: Object,
  data: Array,
}

class MentionVariableTools extends React.Component {
  state = {
    top: null,
    left: null,
    showSuggestor: false,
    text: '',
    currentSelection: 0,
    startPosition: null,
    textareaValue: '',
  }

  props: Props

  render() {
    const {
      placeHolder, type, isrequired, className, style, data,
    } = this.props
    return (
      <div
        style={{ position: 'relative' }}
        onKeyDown={this.handleSuggestionKeyDown}
      >
        <InputTrigger
          trigger={{
            keyCode: 50,
            shiftKey: true,
          }}
          onStart={(obj) => { this.toggleSuggestor(obj) }}
          onCancel={(obj) => { this.toggleSuggestor(obj) }}
          onType={(obj) => { this.handleInput(obj) }}
          endTrigger={(endHandler) => { this.endHandler = endHandler }}
        >
          {type === 'inputText' ?
            <input
              style={style}
              className={className}
              placeholder={placeHolder}
              onChange={e => this.handleTextareaInput(e)}
              value={this.state.textareaValue}
              required={isrequired ? 'required' : null}
            />
            :
              <textarea
                className={className}
                onChange={e => this.handleTextareaInput(e)}
                required={isrequired ? 'required' : null}
                value={this.state.textareaValue}
                placeholder={placeHolder}
              />
          }
        </InputTrigger>
        <div
          id="dropdown"
          style={{
            position: 'absolute',
            zIndex: 1,
            width: '200px',
            borderRadius: '6px',
            background: '#fff',
            boxShadow: 'rgba(0, 0, 0, 0.4) 0px 1px 4px',
            display: this.state.showSuggestor ? 'block' : 'none',
            top: this.state.top,
            left: this.state.left,
          }}
        >
          {data && data
            .filter(field => field.label.indexOf(this.state.text) !== -1)
            .map((field, index) => (
              <div
                key={field.id}
                style={{
                  padding: '10px 20px',
                  background: index === this.state.currentSelection ? '#eee' : '',
                }}
              >
                {field.label}
              </div>
            ))}
        </div>
      </div>
    )
  }

  toggleSuggestor = (obj) => {
    const { hookType, cursor } = obj
    if (hookType === 'start') {
      this.setState({
        showSuggestor: true,
        left: cursor.left,
        top: cursor.top + cursor.height,
      })
    }
    if (hookType === 'cancel') {
      this.setState({
        showSuggestor: false,
        top: null,
        left: null,
        startPosition: null,
      })
    }
  }

  handleInput = (obj) => {
    this.setState({ text: obj.text })
  }

  handleSuggestionKeyDown = (event) => {
    const { which } = event
    const { currentSelection } = this.state
    const { data } = this.props
    if (which === 40) { // 40 is the character code of the down arrow
      event.preventDefault()
      this.setState({
        currentSelection: (currentSelection + 1) % data.length,
      })
    }
    if (which === 13) { // 13 is the character code for enter
      event.preventDefault()
      const { startPosition, textareaValue } = this.state
      const user = data[currentSelection]
      const newText = `${textareaValue.slice(0, startPosition - 1)}${user}${textareaValue.slice(startPosition + user.length, textareaValue.length)}`
      // reset the state and set new text
      this.setState({
        showSuggestor: false,
        left: null,
        top: null,
        text: null,
        startPosition: null,
        textareaValue: newText,
      })
      this.endHandler()
    }
  }

  handleTextareaInput(e) {
    this.props.value(e.target.value)
    this.setState({
      textareaValue: e.target.value,
    })
  }
}

export default MentionVariableTools
