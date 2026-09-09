import { useState } from 'react'

export default function PasswordInput({ value, onChange, className = '' }) {
  const [show, setShow] = useState(false)

  return (
    <div className={`relative ${className}`}>
      <input
        name="password"
        type={show ? 'text' : 'password'}
        placeholder="Password"
        value={value}
        onChange={onChange}
        required
        className="border border-gray-300 rounded px-3 py-2 pr-10 text-sm w-full focus:outline-none focus:ring-2"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer focus:outline-none"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228l4.447 4.447M6.228 6.228L3 3m3.228 3.228 3.901 3.901A3.01 3.01 0 0 0 12 9a3 3 0 0 1 3.255 3.455l3.901 3.901m-4.447-4.447L21 21m-7.223-4.228L3.98 8.223"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        )}
      </button>
    </div>
  )
}