/*global chrome*/
import React from 'react'
import logo from '../128.png'

class Header extends React.Component {
	render() {
		return (
			<header>
				<div className='wrap'>
					<img
						src={logo}
						className='logo'
						alt='logo'
						height='36px'
						width='36px'
					/>
					<strong>Formatter</strong>
					<a
						href='https://jlodes.com'
						target='_blank'
						rel='noreferrer'
						title='Open my portfolio'
					>
						by jlodes
					</a>
				</div>
			</header>
		)
	}
}

export default Header
