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
})
