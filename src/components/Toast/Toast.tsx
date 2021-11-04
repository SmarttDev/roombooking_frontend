import React, { Fragment, useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Transition } from '@headlessui/react'
import {
  CheckCircleIcon,
  ExclamationIcon,
  ShieldExclamationIcon,
  InformationCircleIcon,
  XIcon,
} from '@heroicons/react/solid'

import { ToastProps, types } from './types'
import { classNames } from 'utils'

const Toast: React.FC<ToastProps> = ({ toast, onRemove, ttl }) => {
  const [show, setShow] = useState(false)
  const timer = useRef<number>()
  const removeHandler = useRef(onRemove)
  const { id, title, description, type, action } = toast

  const handleRemove = useCallback(() => removeHandler.current(id), [id, removeHandler])

  const handleMouseEnter = () => {
    clearTimeout(timer.current)
  }

  const handleMouseLeave = () => {
    if (timer.current) {
      clearTimeout(timer.current)
    }

    timer.current = window.setTimeout(() => {
      handleRemove()
    }, ttl)
  }

  useEffect(() => {
    if (timer.current) {
      clearTimeout(timer.current)
    }

    timer.current = window.setTimeout(() => {
      handleRemove()
    }, ttl)

    setShow(true)

    return () => {
      clearTimeout(timer.current)
    }
  }, [timer, ttl, handleRemove])

  return (
    <Transition
      show={show}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={classNames(
          type === types.INFO ? 'bg-black' : '',
          type === types.SUCCESS ? 'bg-black' : '',
          type === types.WARNING ? 'bg-black' : '',
          type === types.DANGER ? 'bg-black' : '',
          'max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden',
        )}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {type === types.INFO && (
                <InformationCircleIcon className="h-6 w-6 text-default" aria-hidden="true" />
              )}
              {type === types.SUCCESS && (
                <CheckCircleIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
              )}
              {type === types.WARNING && (
                <ExclamationIcon className="h-6 w-6 text-default" aria-hidden="true" />
              )}
              {type === types.DANGER && (
                <ShieldExclamationIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
              )}
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p
                className={classNames(
                  type === types.INFO ? 'text-default' : '',
                  type === types.SUCCESS ? 'text-green-600' : '',
                  type === types.WARNING ? 'text-default' : '',
                  type === types.DANGER ? 'text-red-600' : '',
                  'text-sm font-medium',
                )}
              >
                {title}
              </p>
              <p className="mt-1 text-sm text-white">{description}</p>
              {action && (
                <div className="mt-3 flex space-x-7">
                  <Link href={action.url} passHref>
                    <button className="bg-black rounded-md text-sm font-medium text-gray hover:text-default focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                      {action.text}
                    </button>
                  </Link>
                </div>
              )}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="rounded-md inline-flex text-white hover:text-gray-200 focus:outline-none focus:ring-0"
                onClick={handleRemove}
              >
                <span className="sr-only">Close</span>
                <XIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  )
}

export default Toast
