<template>
  <div class="signup-page">
    <VImg src="~/assets/landing-bg.jpeg" cover class="bg-image" />

    <div class="topbar">
      <NuxtLink to="/signin">
        <VBtn class="sign-in-btn" size="large">Sign In</VBtn>
      </NuxtLink>
    </div>

    <div class="content">
      <div class="left">
        <div class="brand">TripWave</div>
        <div class="byline">Designed by CodeWave Group</div>
      </div>

      <div class="right">
        <h1 class="tagline">Create Your Account</h1>
        <p class="sub">
          Ready to start your journey?<br />Fill in your details below.
        </p>

        <div class="form-container">
          <VForm @submit.prevent="submit">
            <div class="form-fields">
              <VTextField
                v-model="email"
                :rules="[ruleRequired, ruleEmail]"
                label="Email address"
                type="email"
                variant="solo"
                hide-details="auto"
                density="comfortable"
                size="large"
                class="form-field"
              />

              <VTextField
                v-model="name"
                :rules="[ruleRequired]"
                label="Name"
                variant="solo"
                hide-details="auto"
                density="comfortable"
                size="large"
                class="form-field"
              />

              <VTextField
                v-model="password"
                :rules="[ruleRequired, rulePassLen]"
                label="Password"
                type="password"
                variant="solo"
                hide-details="auto"
                density="comfortable"
                size="large"
                class="form-field"
              />

              <VTextField
                v-model="confirmPassword"
                :rules="[ruleRequired, rulePasswordMatch]"
                label="Confirm Password"
                type="password"
                variant="solo"
                hide-details="auto"
                density="comfortable"
                size="large"
                class="form-field"
              />

              <VBtn
                type="submit"
                class="primary-btn"
                size="large"
                :loading="isLoading"
                :disabled="isLoading"
              >
                {{ isLoading ? "Signing Up..." : "Sign Up" }}
              </VBtn>
            </div>
          </VForm>

          <!-- Error Message -->
          <VAlert
            v-if="errorMessage"
            type="error"
            class="mt-3"
            :text="errorMessage"
            variant="outlined"
            closable
            @click:close="errorMessage = ''"
          />

          <VAlert
            v-if="emailChecked && emailExists"
            type="warning"
            variant="tonal"
            class="mt-3"
          >
            This email already has an account. Please
            <NuxtLink to="/signin" class="font-weight-bold text-primary">
              sign in
            </NuxtLink>
            .
          </VAlert>

          <p class="helper mt-3">
            Already have an account?
            <NuxtLink to="/signin" class="link">Sign In</NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Redirect to dashboard if already authenticated
definePageMeta({
  middleware: "guest",
});

const route = useRoute();
const router = useRouter();

const name = ref("");
const email = ref(typeof route.query.email === 'string' ? route.query.email : "");
const password = ref("");
const confirmPassword = ref("");

const emailChecked = ref(false);
const emailExists = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");

const { ruleEmail, rulePassLen, ruleRequired } = useFormRules();
const { signup } = useApi();

const rulePasswordMatch = (value) => {
  return value === password.value || "Passwords do not match";
};

function validateField(rules, value) {
  for (const rule of rules) {
    const result = rule(value);
    if (result !== true) return false;
  }
  return true;
}

// Optionally pre-check email existence
onMounted(async () => {
  emailChecked.value = Boolean(email.value);
  emailExists.value = false;
});

const submit = async () => {
  // Clear previous errors
  errorMessage.value = "";
  emailExists.value = false;

  // Validate all fields
  if (!validateField([ruleRequired, ruleEmail], email.value)) {
    errorMessage.value = "Please enter a valid email address";
    return;
  }
  if (!validateField([ruleRequired], name.value)) {
    errorMessage.value = "Please enter your name";
    return;
  }
  if (!validateField([ruleRequired, rulePassLen], password.value)) {
    errorMessage.value = "Password must be at least 6 characters long";
    return;
  }
  if (!validateField([ruleRequired, rulePasswordMatch], confirmPassword.value)) {
    errorMessage.value = "Passwords do not match";
    return;
  }

  isLoading.value = true;

  try {
    const response = await signup(name.value, email.value, password.value);

    if (response.status === 201 && response.data) {
      // Store token and user data (consistent with signin flow)
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('userId', String(response.data.userId || ''));
        localStorage.setItem('userName', response.data.name || '');
        localStorage.setItem('userEmail', response.data.email || '');
        localStorage.setItem('userRole', response.data.role || 'user');
      }

      // Redirect to dashboard
      await navigateTo("/dashboard");
    } else {
      errorMessage.value = response.message || "Signup failed. Please try again.";
    }
  } catch (error) {
    console.error("Signup error:", error);
    
    // Handle specific error cases
    if (error.message && error.message.includes("already exists")) {
      emailExists.value = true;
      emailChecked.value = true;
      errorMessage.value = "This email already has an account. Please sign in instead.";
    } else if (error.message && error.message.includes("Network error")) {
      errorMessage.value = "Cannot connect to server. Please check your connection and try again.";
    } else {
      errorMessage.value = error.message || "An error occurred. Please try again.";
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.signup-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
}

.bg-image {
  position: absolute;
  inset: 0;
  filter: brightness(100%) saturate(90%);
}

.topbar {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 2;
}

.sign-in-btn {
  background: var(--color-primary);
  color: var(--color-text-light);
}

.content {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  min-height: 100vh;
  padding: 24px clamp(16px, 4vw, 48px);
}

.brand {
  color: var(--color-text-light);
  font-weight: 800;
  font-size: clamp(40px, 8vw, 72px);
  letter-spacing: 1px;
}

.byline {
  margin-top: 8px;
  color: var(--color-text-muted);
}

.right {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--color-card-fg);
}

.tagline {
  color: var(--color-text-light);
  margin: 0 0 8px;
  font-weight: 700;
}

.sub {
  margin: 0 0 16px;
  color: var(--color-text-muted);
}

.form-container {
  display: flex;
  flex-direction: column;
  width: min(400px, 100%);
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: stretch;
}

.form-field :deep(.v-field) {
  background: var(--color-field-bg);
  color: var(--color-card-fg);
}

.primary-btn {
  background: var(--color-primary);
  color: var(--color-text-light);
  padding: 0 28px;
  width: 100%;
  height: 48px;
}

.helper {
  text-align: center;
  color: var(--color-text-muted);
}

.link {
  color: #60a5fa;
  font-weight: 600;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

@media (max-width: 1024px) {
  .content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .right {
    justify-self: center;
    text-align: center;
  }
}
</style>
