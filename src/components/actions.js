/*global chrome*/
import React from 'react'

class Actions extends React.Component {
	constructor(props) {
		super(props)
		this.ref = React.createRef()
		this.rateLimiter = {}

		// the formatting options and callback functions
		this.formats = {
			json: {
				label: 'JSON String Beautifier',
				placeholder: 'Enter unformatted JSON string here',
				callback: () => {
					const textarea = document.querySelector('#textarea')
					const jsonObj = JSON.parse(textarea.value)
					const pretty = JSON.stringify(jsonObj, null, 4)
					textarea.value = pretty
				}
			},
			jsonToQueryParams: {
				label: 'JSON String to URL Query Parameters',
				placeholder: 'Enter json to be converted here',
				callback: () => {
					const textarea = document.querySelector('#textarea')
					const parameters = JSON.parse(textarea.value)
					const queryString = new URLSearchParams(
						parameters
					).toString()
					textarea.value = queryString
				}
			},
			queryParamsToJson: {
				label: 'URL Query Parameters to JSON',
				placeholder: 'Enter query string to be converted here',
				callback: () => {
					const textarea = document.querySelector('#textarea')
					const parameters = new URLSearchParams(textarea.value)
					const jsonObj = {}
					for (const [key, value] of parameters) {
						jsonObj[key] = value
					}
					const jsonString = JSON.stringify(jsonObj, null, 4)
					textarea.value = jsonString
				}
			},
			urlEncoder: {
				label: 'URL Encoder',
				placeholder: 'Enter string to be encoded here',
				callback: () => {
					const textarea = document.querySelector('#textarea')
					const encoded = encodeURIComponent(textarea.value)
					textarea.value = encoded
				}
			},
			urlDecoder: {
				label: 'URL Decoder',
				placeholder: 'Enter string to be decoded here',
				callback: () => {
					const textarea = document.querySelector('#textarea')
					const encoded = decodeURIComponent(textarea.value)
					textarea.value = encoded
				}
			},
			addEscapeCharacters: {
				label: 'Escape HTML Entity Characters',
				placeholder: 'Enter string to be escaped here',
				callback: () => {
					const textarea = document.querySelector('#textarea')
					const encoded = textarea.value
						.replace(/&/g, '&amp;')
						.replace(/</g, '&lt;')
						.replace(/>/g, '&gt;')
						.replace(/"/g, '&quot;')
						.replace(/'/g, '&#039;')
					textarea.value = encoded
				}
			},
			replaceEscapedCharacters: {
				label: 'Un-Escape HTML Entity Characters',
				placeholder: 'Enter string to be un-escaped here',
				callback: () => {
					const textarea = document.querySelector('#textarea')
					const encoded = textarea.value
						.replace(/&amp;/g, '&')
						.replace(/&lt;/g, '<')
						.replace(/&gt;/g, '>')
						.replace(/&quot;/g, '"')
						.replace(/&#039;/g, "'")
					textarea.value = encoded
				}
			}
		}

		this.runFormatCallback = this.runFormatCallback.bind(this)
		this.saveTextareaHeight = this.saveTextareaHeight.bind(this)
		this.changeType = this.changeType.bind(this)
	}

	componentDidMount() {
		this.setTextareaHeight()

		const textarea = document.querySelector('#textarea')
		new ResizeObserver(() => {
			// save the height change
			this.saveTextareaHeight()
		}).observe(textarea)
		textarea.focus()

		const selector = document.querySelector('#selector')
		chrome?.storage?.sync?.get(['selectKey'], (result) => {
			if (!result || !result.selectKey) return

			selector.value = result.selectKey

			textarea.setAttribute(
				'placeholder',
				this.formats[result.selectKey]?.placeholder
			)
		})
	}

	returnDropdownOptions() {
		return Object.keys(this.formats).map((key) => (
			<option key={key} value={key}>
				{this.formats[key].label}
			</option>
		))
	}

	runFormatCallback() {
		// handle the on click event
		const key = document.querySelector('#selector').value
		const errorTag = document.querySelector('#errors')
		errorTag.innerHTML = ''
		try {
			this.formats[key]?.callback()
		} catch (err) {
			// add the error message
			errorTag.innerHTML = err.message
				.replace(/</g, '&lt;')
				.replace(/&/g, '&amp;')

			if (err.message.includes(' at position ')) {
				const position = parseInt(err.message.split(' at position ')[1])
				if (!position) return
				const textarea = document.querySelector('#textarea')
				textarea.focus()

				const fullText = textarea.value
				textarea.value = fullText.substring(0, position + 1)
				textarea.scrollTop = 0
				textarea.scrollTop = textarea.scrollHeight

				textarea.value = fullText

				textarea.setSelectionRange(position, position + 1)
			}
		}
	}

	copyToClipboard() {
		document.querySelector('#errors').innerHTML = ''
		document.querySelector('#textarea').select()
		document.execCommand('copy')
	}

	clearTextarea() {
		document.querySelector('#textarea').value = ''
		document.querySelector('#errors').innerHTML = ''
	}

	changeType() {
		const textarea = document.querySelector('#textarea')
		const key = document.querySelector('#selector').value
		textarea.setAttribute('placeholder', this.formats[key]?.placeholder)

		document.querySelector('#errors').innerHTML = ''

		if (this.rateLimiter.selectKey) {
			clearInterval(this.rateLimiter.selectKey)
		}

		this.rateLimiter.selectKey = setInterval(() => {
			if (typeof chrome !== 'undefined' && chrome !== null) {
				chrome?.storage?.sync?.set({
					selectKey: key
				})
			}
		}, 1000)

		textarea.focus()
	}

	setTextareaHeight() {
		if (typeof chrome !== 'undefined' && chrome !== null) {
			chrome?.storage?.sync?.get(['textareaHeight'], (result) => {
				if (!result) return

				const textarea = document.querySelector('#textarea')
				textarea.style.height = result.textareaHeight
			})
		}
	}

	saveTextareaHeight() {
		if (this.rateLimiter.textareaHeight) {
			clearInterval(this.rateLimiter.textareaHeight)
		}

		this.rateLimiter.textareaHeight = setInterval(() => {
			if (typeof chrome !== 'undefined' && chrome !== null) {
				const textarea = document.querySelector('#textarea')
				chrome?.storage?.sync?.set({
					textareaHeight: `${textarea.offsetHeight}px`
				})
				return false
			}
		}, 1000)
	}

	render() {
		return (
			<div className='actions'>
				<div className='selector wrap'>
					<label htmlFor='selector'>
						<p>Select formatter</p>
					</label>
					<a
						id='openAsTab'
						href=''
						target='_blank'
						rel='noreferrer'
						title='Open in a new tab'
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							height='24px'
							viewBox='0 0 24 24'
							width='24px'
							fill='currentColor'
						>
							<path d='M0 0h24v24H0V0z' fill='none' />
							<path d='M18 19H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h5c.55 0 1-.45 1-1s-.45-1-1-1H5c-1.11 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-6c0-.55-.45-1-1-1s-1 .45-1 1v5c0 .55-.45 1-1 1zM14 4c0 .55.45 1 1 1h2.59l-9.13 9.13c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L19 6.41V9c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1h-5c-.55 0-1 .45-1 1z' />
						</svg>
					</a>
					<select id='selector' onChange={this.changeType}>
						{this.returnDropdownOptions()}
					</select>
					<textarea
						id='textarea'
						placeholder={this.formats['json'].placeholder}
					></textarea>
					<p id='errors'></p>
				</div>
				<div className='buttons'>
					<div className='wrap'>
						<button
							type='button'
							className='format'
							onClick={this.runFormatCallback}
						>
							Format
						</button>
						<button
							type='button'
							className='copy'
							onClick={this.copyToClipboard}
						>
							Copy
						</button>
						<button
							type='button'
							className='clear'
							onClick={this.clearTextarea}
						>
							Clear
						</button>
					</div>
				</div>
			</div>
		)
	}
}

export default Actions
