import Toast from './Toast'
import { ToastContainerProps } from './types'

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove, ttl = 6000 }) => {
  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 pt-6 pointer-events-none sm:p-6 sm:items-start z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={onRemove} ttl={ttl} />
        ))}
      </div>
    </div>
  )
}

export default ToastContainer
