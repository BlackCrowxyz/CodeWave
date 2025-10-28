<template>
  <div class="dashboard-page">
    <VContainer fluid>
      <VRow>
        <VCol cols="12">
          <!-- Header -->
          <div class="d-flex justify-space-between align-center mb-6">
            <div>
              <h1 class="text-h3 font-weight-bold">Welcome to TripWave</h1>
              <p class="text-h6 text-medium-emphasis">{{ userName ? `Hello, ${userName}!` : 'Plan your next journey' }}</p>
            </div>
            
            <VBtn
              color="error"
              variant="outlined"
              @click="handleSignout"
              :loading="signingOut"
            >
              Sign Out
            </VBtn>
          </div>

          <!-- Dashboard Content -->
          <VRow>
            <VCol cols="12" md="6" lg="4">
              <VCard class="h-100">
                <VCardTitle>My Journeys</VCardTitle>
                <VCardText>
                  <p>Plan and manage your travel itineraries</p>
                  <VBtn color="primary" class="mt-2">View Journeys</VBtn>
                </VCardText>
              </VCard>
            </VCol>
            
            <VCol cols="12" md="6" lg="4">
              <VCard class="h-100">
                <VCardTitle>Transit Info</VCardTitle>
                <VCardText>
                  <p>Real-time transit updates and schedules</p>
                  <VBtn color="primary" class="mt-2">View Transit</VBtn>
                </VCardText>
              </VCard>
            </VCol>
            
            <VCol cols="12" md="6" lg="4">
              <VCard class="h-100">
                <VCardTitle>Profile</VCardTitle>
                <VCardText>
                  <p>Manage your account settings</p>
                  <VBtn color="primary" class="mt-2">Edit Profile</VBtn>
                </VCardText>
              </VCard>
            </VCol>
          </VRow>

          <!-- User Info Debug (Remove in production) -->
          <VCard class="mt-6" v-if="userInfo">
            <VCardTitle>User Information</VCardTitle>
            <VCardText>
              <pre>{{ JSON.stringify(userInfo, null, 2) }}</pre>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </VContainer>
  </div>
</template>

<script setup>
// Protect this route - redirect to signin if not authenticated
definePageMeta({
  middleware: 'auth'
})

const signingOut = ref(false)
const userName = ref('')
const userInfo = ref(null)

const { signout } = useApi()

// Load user data on component mount
onMounted(() => {
  if (process.client) {
    userName.value = localStorage.getItem('userName') || ''
    userInfo.value = {
      userId: localStorage.getItem('userId'),
      userName: localStorage.getItem('userName'),
      userEmail: localStorage.getItem('userEmail'),
      userRole: localStorage.getItem('userRole'),
    }
  }
})

const handleSignout = async () => {
  signingOut.value = true
  
  try {
    await signout()
  } catch (error) {
    console.error('Signout error:', error)
  } finally {
    // Clear local storage regardless of API call success
    if (process.client) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('userId')
      localStorage.removeItem('userName')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userRole')
    }
    
    // Redirect to signin
    await navigateTo('/signin')
    signingOut.value = false
  }
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: var(--color-background);
  padding: 24px;
}
</style>
