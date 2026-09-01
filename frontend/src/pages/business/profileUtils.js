export function normalizeBusinessProfile(raw = {}) {
  const get = (...keys) => {
    for (const key of keys) {
      if (raw[key] !== undefined && raw[key] !== null) return raw[key]
    }
    return ''
  }

  return {
    businessId: get('business_id', 'businessId', 'id'),
    businessName: get('business_name', 'businessName'),
    ownerName: get('owner_name', 'ownerName'),
    email: get('email'),
    phoneNumber: get('phone_number', 'phoneNumber'),
    address: get('address'),
    businessType: get('business_type', 'businessType'),
    kifleKetema: get('kifle_ketema', 'kifleKetema'),
    kebele: get('kebele'),
    registrationDate: get('created_at', 'createdAt', 'registrationDate'),
  }
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

export const BUSINESS_TYPES = [
  'Hotel',
  'Restaurant',
  'Café',
  'Supermarket',
  'Office',
  'Factory',
  'Other',
]
