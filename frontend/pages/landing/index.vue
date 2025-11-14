<template>
  <div class="landing-page">
    <VImg src="~/assets/landing-bg.jpeg" cover class="bg-image" />

    <div class="topbar">
      <NuxtLink to="/signin">
        <VBtn class="sign-in-btn" size="large">Sign In</VBtn>
      </NuxtLink>
      <NuxtLink to="/signup">
        <VBtn class="sign-up-btn" size="large">Sign Up</VBtn>
      </NuxtLink>
    </div>

    <div class="content">
      <div class="hero">
        <div class="brand">TripWave</div>
        <div class="byline">Designed by CodeWave Group</div>
        <p class="description">
          Plan your perfect Irish adventure with AI-powered recommendations
        </p>
        <div class="cta-buttons">
          <NuxtLink to="/signup">
            <VBtn class="cta-primary" size="large">Get Started</VBtn>
          </NuxtLink>
          <NuxtLink to="/signin">
            <VBtn class="cta-secondary" size="large" variant="outlined">Sign In</VBtn>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Landing page - accessible to all
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
  display: flex;
  gap: 12px;
}

.sign-in-btn,
.sign-up-btn {
  background: var(--color-primary);
  color: var(--color-text-light);
}

.content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px clamp(16px, 4vw, 48px);
}

.hero {
  text-align: center;
  color: var(--color-text-light);
  max-width: 800px;
}

.brand {
  font-weight: 800;
  font-size: clamp(48px, 10vw, 96px);
  letter-spacing: 1px;
  margin-bottom: 16px;
}

.byline {
  margin-bottom: 24px;
  color: var(--color-text-muted);
  font-size: 18px;
}

.description {
  font-size: clamp(18px, 3vw, 24px);
  margin: 0 0 40px;
  color: var(--color-text-light);
  line-height: 1.6;
}

.cta-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-primary {
  background: var(--color-primary);
  color: var(--color-text-light);
  padding: 0 32px;
  font-weight: 700;
}

.cta-secondary {
  border-color: rgba(255, 255, 255, 0.8);
  color: var(--color-text-light);
  padding: 0 32px;
  font-weight: 700;
}

@media (max-width: 768px) {
  .topbar {
    flex-direction: column;
    gap: 8px;
  }

  .cta-buttons {
    flex-direction: column;
    width: 100%;
  }

  .cta-primary,
  .cta-secondary {
    width: 100%;
  }
}
</style>

