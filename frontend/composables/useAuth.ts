// Authentication composable for managing user auth state and signout
export const useAuth = () => {
  const { signout: apiSignout } = useApi()

  // Sign out function that properly clears all auth data
  const signout = async () => {
    try {
      // Call backend signout API
      if (process.client) {
        await apiSignout()
      }
    } catch (error) {
      // Even if API call fails, we should still clear local storage
      console.error('Signout API error:', error)
    } finally {
      // Clear all authentication data from localStorage
      if (process.client) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('userId')
        localStorage.removeItem('userName')
        localStorage.removeItem('userEmail')
        localStorage.removeItem('userRole')
        // Also clear any legacy keys that might exist
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
      }
      
      // Redirect to signin page using Nuxt's navigateTo
      await navigateTo('/signin')
    }
  }

  // Check if user is authenticated
  const isAuthenticated = () => {
    if (process.client) {
      return !!localStorage.getItem('accessToken')
    }
    return false
  }

  // Get current user data
  const getCurrentUser = () => {
    if (process.client) {
      return {
        userId: localStorage.getItem('userId'),
        userName: localStorage.getItem('userName'),
        userEmail: localStorage.getItem('userEmail'),
        userRole: localStorage.getItem('userRole'),
        accessToken: localStorage.getItem('accessToken'),
      }
    }
    return null
  }

  return {
    signout,
    isAuthenticated,
    getCurrentUser,
  }
}

