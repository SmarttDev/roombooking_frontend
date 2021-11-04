import { createContext, useCallback, useState } from 'react'
import kebabCase from 'lodash/kebabCase'
import { Toast, ToastAction, toastTypes } from 'components/Toast'
import { ToastContextApi } from './types'

export const ToastsContext = createContext<ToastContextApi>(undefined)

export const ToastsProvider: React.FC = ({ children }) => {
  const [toasts, setToasts] = useState<ToastContextApi['toasts']>([])

  const toast = useCallback(
    ({ title, description, action, type }: Omit<Toast, 'id'>) => {
      setToasts((prevToasts) => {
        const id = kebabCase(title)

        // Remove any existing toasts with the same id
        const currentToasts = prevToasts.filter((prevToast) => prevToast.id !== id)
        return [
          {
            id,
            title,
            description,
            action,
            type,
          },
          ...currentToasts,
        ]
      })
    },
    [setToasts],
  )

  const toastError = (title: string, description?: string, action?: ToastAction) => {
    return toast({ title, description, action, type: toastTypes.DANGER })
  }
  const toastInfo = (title: string, description?: string, action?: ToastAction) => {
    return toast({ title, description, action, type: toastTypes.INFO })
  }
  const toastSuccess = (title: string, description?: string, action?: ToastAction) => {
    return toast({ title, description, action, type: toastTypes.SUCCESS })
  }
  const toastWarning = (title: string, description?: string, action?: ToastAction) => {
    return toast({ title, description, action, type: toastTypes.WARNING })
  }
  const clear = () => setToasts([])
  const remove = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((prevToast) => prevToast.id !== id))
  }

  return (
    <ToastsContext.Provider
      value={{ toasts, clear, remove, toastError, toastInfo, toastSuccess, toastWarning }}
    >
      {children}
    </ToastsContext.Provider>
  )
}
