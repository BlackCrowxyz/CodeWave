// API composable for making HTTP requests
export const useApi = () => {
  // Get runtime config or fallback to localhost
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase || 'http://localhost:8000/api/v1'

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

      // Check if response has content before trying to parse JSON
      const contentType = response.headers.get('content-type')
      let data
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        // If not JSON, create a data object from response text
        const text = await response.text()
        data = { message: text || `HTTP error! status: ${response.status}` }
      }

      if (!response.ok) {
        // Handle 401 Unauthorized (token expired/invalid)
        if (response.status === 401) {
          // Clear invalid token
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('userId')
            localStorage.removeItem('userName')
            localStorage.removeItem('userEmail')
            localStorage.removeItem('userRole')
            // Redirect to signin if not already there
            if (window.location.pathname !== '/signin') {
              window.location.href = '/signin'
            }
          }
        }
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      // Re-throw with a more user-friendly message if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and ensure the backend server is running.')
      }
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

  const checkEmail = async (email: string) => {
    return await apiRequest('/check-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
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

  // Recommendation methods
  const getRecommendations = async (budget: number, duration: number, currentLocation: number[], interests?: string[]) => {
    return await apiRequest('/recommendations', {
      method: 'POST',
      body: JSON.stringify({ 
        budget, 
        currentLocation, 
        duration, 
        interests: interests || [] 
      }),
    })
  }

  return {
    // Auth
    signin,
    signup,
    signout,
    checkEmail,
    // Users
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    // Recommendations
    getRecommendations,
    // Generic request
    apiRequest,
  }
}
