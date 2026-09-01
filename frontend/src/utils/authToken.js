export function getJwtPayload(token) {
  if (!token) return null

  try {
    const base64 = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/')
    if (!base64) return null
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

export function isAdminApiUrl(url = '') {
  return url.includes('/muAdmin')
}

export function isSystemAdminApiUrl(url = '') {
  return url.includes('/systemAdmin')
}

export function getTokenForRequest(url = '') {
  const residentToken = localStorage.getItem('token')
  const adminToken = localStorage.getItem('adminToken')
  const systemAdminToken = localStorage.getItem('systemAdminToken')

  if (isSystemAdminApiUrl(url)) {
    if (
      systemAdminToken &&
      getJwtPayload(systemAdminToken)?.role === 'system_admin'
    ) {
      return systemAdminToken
    }
    return systemAdminToken || adminToken || residentToken
  }

  if (isAdminApiUrl(url)) {
    if (adminToken && getJwtPayload(adminToken)?.role === 'municipal_admin') {
      return adminToken
    }

    if (
      residentToken &&
      getJwtPayload(residentToken)?.role === 'municipal_admin'
    ) {
      return residentToken
    }

    return adminToken || residentToken
  }

  if (
    residentToken &&
    getJwtPayload(residentToken)?.role !== 'municipal_admin' &&
    getJwtPayload(residentToken)?.role !== 'system_admin'
  ) {
    return residentToken
  }

  return residentToken || adminToken || systemAdminToken
}

export function clearAuthStorage() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminUser')
  localStorage.removeItem('systemAdminToken')
  localStorage.removeItem('systemAdminUser')
}
