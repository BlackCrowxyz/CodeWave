<template>
  <div class="sign-in-page">
    <VImg src="/assets/landing-bg.jpeg" cover class="bg-image" />

    <div class="headline">TripWave</div>

    <div class="form-shell">
      <div class="form-card">
        <h1 class="title">Sign In</h1>

        <VForm @submit.prevent="submit" class="mt-7">
          <div class="mt-1">
            <label class="label" for="email"></label>
            <v-text-field
              :rules="[ruleRequired, ruleEmail]"
              v-model="email"
              id="email"
              label="Email"
              type="email"
              variant="solo"
              density="comfortable"
              hide-details="auto"
              class="input-field"
            />
          </div>
          <br />
          <div class="mt-1">
            <label class="label" for="password"></label>
            <v-text-field
              :rules="[ruleRequired, rulePassLen]"
              v-model="password"
              id="password"
              label="Password"
              type="password"
              variant="solo"
              density="comfortable"
              hide-details="auto"
              class="input-field"
            />
          </div>
          <div class="mt-5">
            <VBtn
              type="submit"
              block
              min-height="44"
              class="primary-btn"
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
          class="mt-4"
          :text="errorMessage"
          variant="outlined"
        />

        <p class="helper">
          Don't have an account?
          <NuxtLink to="/signup" class="link">Sign Up</NuxtLink>
        </p>
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
.sign-in-page {
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

.headline {
  position: absolute;
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--color-text-light);
  font-weight: 800;
  font-size: clamp(32px, 6vw, 72px);
  letter-spacing: 2px;
}

.form-shell {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.form-card {
  width: min(400px, 100%);
  background: var(--color-overlay);
  backdrop-filter: blur(6px);
  border-radius: 16px;
  padding: 32px 28px 24px;
  color: var(--color-card-fg);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}

.title {
  text-align: center;
  color: var(--color-text-light);
  margin: 6px 0 8px;
}

.label {
  display: inline-block;
  margin-bottom: 6px;
  color: var(--color-text-muted);
}

.primary-btn {
  background: var(--color-primary);
  color: var(--color-text-light);
}

.helper {
  margin-top: 18px;
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

.input-field :deep(.v-field) {
  background: var(--color-field-bg);
  color: var(--color-card-fg);
}
</style>
