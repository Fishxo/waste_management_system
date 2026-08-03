export function normalizeProfile(raw = {}) {
  const get = (...keys) => {
    for (const key of keys) {
      if (raw[key] !== undefined && raw[key] !== null) return raw[key]
    }
    return ''
  }

  return {
    firstName: get('first_name', 'firstName'),
    lastName: get('last_name', 'lastName'),
    email: get('email'),
    phoneNumber: get('phone_number', 'phoneNumber'),
    kifleKetema: get('kifle_ketema', 'kifleKetema'),
    kebele: get('kebele'),
    sefer: get('sefer'),
    registrationDate: get('created_at', 'createdAt', 'registrationDate'),
  }
}

export function getInitials(firstName = '', lastName = '') {
  const first = String(firstName || '').trim().charAt(0)
  const last = String(lastName || '').trim().charAt(0)
  return (first + last).toUpperCase() || '?'
}

export function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
