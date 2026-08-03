export default function Toast({ message, type = 'success', onClose }) {
  const styles = {
    success: 'bg-green-600',
    error: 'bg-red-600',
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${styles[type]}`}
      role="alert"
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="text-white/80 hover:text-white cursor-pointer"
        aria-label="Dismiss notification"
      >
        &times;
      </button>
    </div>
  )
}
