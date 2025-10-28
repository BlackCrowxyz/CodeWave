// Auth middleware to protect routes
export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware on server-side rendering
  if (typeof window === 'undefined') return

  // Check if user is authenticated
  const token = localStorage.getItem('accessToken')
  
  if (!token) {
    // Redirect to signin if no token found
    return navigateTo('/signin')
  }
  
  // Optional: You could also validate the token with the backend here
  // For now, we'll just check if it exists
})
