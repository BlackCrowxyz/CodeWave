// API composable for making HTTP requests
export const useApi = () => {
  // Get runtime config or fallback to localhost
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase || 'http://localhost:3001/api/v1'

  // Generic API request function
  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${baseURL}${endpoint}`
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    // Get token from localStorage if available (client-side only)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      if (token) {
        defaultHeaders['x-access-token'] = token
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: defaultHeaders,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Auth methods
  const signin = async (email: string, password: string) => {
    return await apiRequest('/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  const signup = async (name: string, email: string, password: string, role = 'user') => {
    return await apiRequest('/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    })
  }

  const signout = async () => {
    return await apiRequest('/signout', {
      method: 'POST',
    })
  }

  // User methods
  const getUsers = async () => {
    return await apiRequest('/users')
  }

  const getUserById = async (id: string) => {
    return await apiRequest(`/users/${id}`)
  }

  const updateUser = async (id: string, name: string, email: string) => {
    return await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, email }),
    })
  }

  const deleteUser = async (id: string) => {
    return await apiRequest(`/users/${id}`, {
      method: 'DELETE',
    })
  }

  return {
    // Auth
    signin,
    signup,
    signout,
    // Users
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    // Generic request
    apiRequest,
  }
}
