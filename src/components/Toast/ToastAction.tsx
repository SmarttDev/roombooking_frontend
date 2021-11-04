import React from 'react'
import Link from 'next/link'
import getExternalLinkProps from 'utils/getExternalLinkProps'
import { ToastAction as Action } from './types'

interface ToastActionProps {
  action: Action
}

const ToastAction: React.FC<ToastActionProps> = ({ action }) => {
  if (action.url.startsWith('http')) {
    return (
      <Link href={action.url} {...getExternalLinkProps()}>
        <a>{action.text}</a>
      </Link>
    )
  }

  return (
    <Link href={action.url}>
      <a>{action.text}</a>
    </Link>
  )
}

export default ToastAction
