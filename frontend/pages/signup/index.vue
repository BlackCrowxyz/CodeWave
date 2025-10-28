<template>
  <VContainer fluid class="fill-height">
    <VRow no-gutters align="center" justify="center" class="fill-height">
      <VCol cols="12" md="6" lg="5" sm="6">
        <VRow no-gutters align="center" justify="center">
          <VCol cols="12" md="6">
            <h1>Sign Up</h1>
            <p class="text-medium-emphasis">
              Enter your details to get started
            </p>

            <VForm @submit.prevent="submit" class="mt-7">
              <div>
                <label class="label text-grey-darken-2" for="name">Name</label>
                <VTextField
                  :rules="[ruleRequired]"
                  v-model="name"
                  prepend-inner-icon="fluent:person-24-regular"
                  id="name"
                  name="name"
                />
              </div>
              <div class="mt-1">
                <label class="label text-grey-darken-2" for="email"
                  >Email</label
                >
                <VTextField
                  :rules="[ruleRequired, ruleEmail]"
                  v-model="email"
                  type="email"
                  prepend-inner-icon="fluent:mail-24-regular"
                  id="email"
                  name="email"
                />
              </div>
              <div class="mt-1">
                <label class="label text-grey-darken-2" for="password"
                  >Password</label
                >
                <VTextField
                  :rules="[ruleRequired, rulePassLen]"
                  type="password"
                  v-model="password"
                  prepend-inner-icon="fluent:password-20-regular"
                  id="password"
                  name="password"
                />
              </div>
              <div class="mt-5">
                <VBtn
                  type="submit"
                  block
                  min-height="45"
                  class="gradient primary"
                  :loading="loading"
                  :disabled="loading"
                  >{{ loading ? 'Creating Account...' : 'Create Account' }}</VBtn
                >
              </div>
            </VForm>
            
            <!-- Error Message -->
            <VAlert
              v-if="errorMessage"
              type="error"
              class="mt-4"
              :text="errorMessage"
              variant="outlined"
            />
            <p class="text-body-2 mt-10">
              <span
                >Already have an account?
                <NuxtLink to="/signin" class="font-weight-bold text-primary"
                  >Sign In</NuxtLink
                ></span
              >
            </p>
          </VCol>
        </VRow>
      </VCol>
      <VCol class="hidden-md-and-down fill-height" md="6" lg="7">
        <VImg
          src="https://wallpaper.dog/large/5557744.jpg"
          cover
          class="h-100 rounded-xl d-flex align-center justify-center"
        >
          <div class="text-center w-50 text-white mx-auto">
            <h2 class="mb-4">Start your journey today</h2>
            <p>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit.
              Asperiores, inventore quia. Dolorum dolores ad ipsum voluptatum
              rem, hic placeat, odio, odit numquam quod veritatis accusantium
              assumenda! Sequi, provident in! Iure!
            </p>
          </div>
        </VImg>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup>
// Redirect to dashboard if already authenticated
definePageMeta({
  middleware: 'guest'
})

const name = ref("");
const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");

// Pre-fill email from query parameter if provided
const route = useRoute()
onMounted(() => {
  if (route.query.email && typeof route.query.email === 'string') {
    email.value = route.query.email
  }
})

const { ruleEmail, rulePassLen, ruleRequired } = useFormRules();
const { signup } = useApi();

const submit = async () => {
  if (!name.value || !email.value || !password.value) {
    errorMessage.value = "Please fill in all fields";
    return;
  }

  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await signup(name.value, email.value, password.value);
    
    if (response.status === 201 && response.data) {
      // Store authentication data
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('userId', response.data.userId);
      localStorage.setItem('userName', response.data.name);
      localStorage.setItem('userEmail', response.data.email);
      localStorage.setItem('userRole', response.data.role);
      
      // Navigate to dashboard or home page
      await navigateTo('/dashboard');
    }
  } catch (error) {
    console.error('Signup error:', error);
    errorMessage.value = error.message || 'Sign up failed. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>
