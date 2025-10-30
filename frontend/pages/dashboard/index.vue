<template>
  <div class="dashboard">
    <!-- Top Header -->
    <header class="topbar">
      <div class="brand">TripWave</div>
      <VBtn class="signout-btn" variant="outlined" @click="handleSignOut"
        >Sign Out</VBtn
      >
    </header>

    <!-- Intro Banner -->
    <section class="intro">
      <h1 class="into-title">Explore Ireland with Smart Recommendations</h1>
      <p class="intro-sub">
        Get personal itineraries based on your location, budget, and preference
      </p>
      <VBtn class="intro-cta" size="large" @click="startPlanning">
        Start Planning Your Visit
      </VBtn>
    </section>

    <!-- Feature Cards -->
    <section class="features">
      <div class="feature-card">
        <div class="icon">🗺️</div>
        <h3 class="feature-title">Smart Routing</h3>
        <p class="feature-sub">
          Find the best walking routes to bus stops and optimal transport
          connections
        </p>
      </div>

      <div class="feature-card">
        <div class="icon">💰</div>
        <h3 class="feature-title">Budget-Friendly</h3>
        <p class="feature-sub">
          Get recommendations that fit your budget with cost estimates for each
          activity
        </p>
      </div>

      <div class="feature-card">
        <div class="icon">🤖</div>
        <h3 class="feature-title">AI-Powered</h3>
        <p class="feature-sub">
          Personalized suggestions based on your interests and travel
          preferences
        </p>
      </div>

      <div class="feature-card">
        <div class="icon">🚌</div>
        <h3 class="feature-title">Real-time Transport</h3>
        <p class="feature-sub">
          Live bus timings and routes integrated with your itinerary
        </p>
      </div>
    </section>

    <!-- How it Works -->
    <section class="how">
      <h2 class="how-title">How it works</h2>

      <div class="steps">
        <div class="step-card">
          <div class="badge">1</div>
          <h4 class="step-title">Share Your Details</h4>
          <p class="step-sub">
            Tell us your budget, location, and what you're interested in
          </p>
        </div>

        <div class="step-card">
          <div class="badge">2</div>
          <h4 class="step-title">Get Smart Recommendations</h4>
          <p class="step-sub">
            Our AI analyzes your preferences and suggests the best places to
            visit
          </p>
        </div>

        <div class="step-card">
          <div class="badge">3</div>
          <h4 class="step-title">Follow Your Itinerary</h4>
          <p class="step-sub">
            Get turn-by-turn directions and live transport information
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const router = useRouter();

const startPlanning = () => {
  router.push("/plan");
};

const handleSignOut = () => {
  if (process.client) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
  }
  router.push("/signin");
};
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: var(--color-main-bg);
  padding-bottom: 40px;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-primary);
  color: var(--color-text-light);
  padding: 14px 24px;
}

.brand {
  font-weight: 800;
  font-size: clamp(24px, 4vw, 42px);
}

.signout-btn {
  color: var(--color-text-light);
  border-color: rgba(255, 255, 255, 0.8);
}

.intro {
  margin: 24px;
  background: var(--color-primary);
  color: var(--color-text-light);
  border-radius: 14px;
  padding: 36px 20px;
  text-align: center;
}

.intro-title {
  margin: 0 0 10px;
  font-weight: 800;
  font-size: clamp(24px, 4.5vw, 40px);
}

.intro-sub {
  margin: 0 0 20px;
  color: #e5e7eb;
}

.intro-cta {
  background: #f59e0b;
  color: #111827;
  font-weight: 700;
}

.features {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 0 24px;
}

.feature-card {
  background: var(--color-main-card-bg);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.feature-title {
  font-weight: 700;
  margin-bottom: 6px;
}

.feature-sub {
  color: #334155;
  font-size: 14px;
}

.how {
  padding: 28px 24px 0;
  text-align: center;
}

.how-title {
  color: var(--color-main-text);
  font-size: clamp(20px, 3.5vw, 28px);
  margin-bottom: 18px;
}

.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.step-card {
  background: var(--color-main-card-bg);
  border-radius: 12px;
  padding: 22px;
  text-align: center;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: #e5e7eb;
  color: #1f2937;
  font-weight: 700;
  margin-bottom: 10px;
}

.step-title {
  font-weight: 700;
  margin-bottom: 8px;
}

.step-sub {
  color: #334155;
  font-size: 14px;
}

@media (max-width: 1100px) {
  .features {
    grid-template-columns: repeat(2, 1fr);
  }
  .steps {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .features {
    grid-template-columns: 1fr;
  }
}
</style>
