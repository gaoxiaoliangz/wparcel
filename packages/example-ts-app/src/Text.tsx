import React from 'react'
import classes from './Text.module.scss'

const Text = ({ content }) => {
  return <div className={classes.text}>{content}</div>
}

export default Text
