<template>
  <div class="signin-page">
    <VImg src="~/assets/landing-bg.jpeg" cover class="bg-image" />

    <div class="topbar">
      <NuxtLink to="/signup">
        <VBtn class="sign-up-btn" size="large">Sign Up</VBtn>
      </NuxtLink>
    </div>

    <div class="content">
      <div class="left">
        <div class="brand">TripWave</div>
        <div class="byline">Designed by CodeWave Group</div>
      </div>

      <div class="right">
        <h1 class="tagline">Welcome Back</h1>
        <p class="sub">
          Ready to continue your journey?<br />Sign in to your account.
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

              <VBtn
                type="submit"
                class="primary-btn"
                size="large"
                :loading="loading"
                :disabled="loading"
              >
                {{ loading ? "Signing In..." : "Sign In" }}
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

          <p class="helper mt-3">
            Don't have an account?
            <NuxtLink to="/signup" class="link">Sign Up</NuxtLink>
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
const email = ref(typeof route.query.email === 'string' ? route.query.email : "");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");

const { ruleEmail, rulePassLen, ruleRequired } = useFormRules();
const { signin } = useApi();

const submit = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = "Please fill in all fields";
    return;
  }

  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await signin(email.value, password.value);

    if (response.status === 200 && response.data) {
      // Store authentication data
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("userName", response.data.name);
      localStorage.setItem("userEmail", response.data.email);
      localStorage.setItem("userRole", response.data.role);

      // Navigate to dashboard or home page
      await navigateTo("/dashboard");
    }
  } catch (error) {
    console.error("Signin error:", error);
    errorMessage.value = error.message || "Sign in failed. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.signin-page {
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

.sign-up-btn {
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
