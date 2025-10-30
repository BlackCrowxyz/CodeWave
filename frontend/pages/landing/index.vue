<template>
  <div class="landing-page">
    <VImg src="/assets/landing-bg.jpeg" cover class="bg-image" />

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
        <h1 class="tagline">Plan Smarter,<br />Explore More for Less</h1>
        <p class="sub">
          Ready to travel?<br />Enter your email to create your account.
        </p>

        <div class="cta">
          <VTextField
            v-model="email"
            class="email-input"
            variant="solo"
            hide-details="auto"
            density="comfortable"
            label="Email address"
            size="large"
          />

          <VBtn class="primary-btn" size="large" @click="handleGetStarted">
            Get Started
          </VBtn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Landing route page
const email = ref("");

const handleGetStarted = () => {
  // Navigate to signup page, optionally with pre-filled email
  if (email.value) {
    navigateTo(`/signup?email=${encodeURIComponent(email.value)}`);
  } else {
    navigateTo("/signup");
  }
};
</script>

<style scoped>
.landing-page {
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
.cta {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}
.email-input {
  width: min(400px);
}

.email-input :deep(.v-field) {
  background: var(--color-field-bg);
  color: var(--color-card-fg);
}
.primary-btn {
  background: var(--color-primary);
  color: var(--color-text-light);
  padding: 0 28px;
  width: min(400px);
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
