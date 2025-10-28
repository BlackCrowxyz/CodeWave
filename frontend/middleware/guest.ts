// Guest middleware to redirect authenticated users away from auth pages
export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware on server-side rendering
  if (typeof window === 'undefined') return

  // Check if user is already authenticated
  const token = localStorage.getItem('accessToken')
  
  if (token) {
    // Redirect to dashboard if already authenticated
    return navigateTo('/dashboard')
  }
})
