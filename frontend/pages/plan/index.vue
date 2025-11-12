<template>
  <div class="plan-page">
    <!-- Top Header -->
    <header class="topbar">
      <div class="brand">TripWave</div>
      <div class="topbar-actions">
        <VBtn class="home-btn" variant="outlined" @click="goToHome">
          Home
        </VBtn>
        <VBtn class="signout-btn" variant="outlined" @click="handleSignOut">
          Sign Out
        </VBtn>
      </div>
    </header>

    <!-- Hero Banner -->
    <section class="hero">
      <h1 class="hero-title">Plan Your Ireland Adventure</h1>
      <p class="hero-sub">
        Let's start with your budget, duration and location
      </p>

      <!-- Progress Bar -->
      <div class="progress-bar">
        <div
          class="progress-filled"
          :style="{ width: progressPercentage + '%' }"
        ></div>
        <div class="progress-empty"></div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="content">
      <div class="content-header">
        <h2 class="content-title">Plan Your Trip</h2>
        <p class="content-sub">Let's start with your budget and location</p>
      </div>

      <div class="form-grid">
        <!-- Left Column -->
        <div class="left-col">
          <div class="form-group">
            <label class="form-label">Budget (€)</label>
            <VTextField
              v-model="budget"
              variant="outlined"
              density="comfortable"
              type="number"
              hide-details="auto"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Duration</label>
            <VSelect
              v-model="duration"
              :items="durationOptions"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              class="form-input"
            />
            <p class="form-hint">Choose a date range, up to 7 days.</p>
          </div>
        </div>

        <!-- Right Column -->
        <div class="right-col">
          <div class="form-group">
            <label class="form-label">Current Location</label>
            <VTextField
              v-model="location"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              class="form-input"
            />
          </div>

          <!-- Map Container -->
          <div class="map-container">
            <div class="map" id="map-container"></div>
          </div>
        </div>
      </div>

      <!-- Continue Button -->
      <div class="actions">
        <VBtn class="continue-btn" size="large" @click="handleContinue">
          Continue
        </VBtn>
      </div>
    </section>
  </div>
</template>

<script setup>
const router = useRouter();

const budget = ref("0");
const duration = ref("");
const location = ref("");
const currentStep = ref(1);

let map = null;

const durationOptions = [
  "1 day",
  "2 days",
  "3 days",
  "4 days",
  "5 days",
  "6 days",
  "7 days",
];

// Calculate progress percentage based on current step
const progressPercentage = computed(() => {
  return (currentStep.value / 3) * 100;
});

const { signout } = useAuth();

const goToHome = () => {
  router.push("/dashboard");
};

const handleSignOut = async () => {
  await signout();
};

const handleContinue = () => {
  // Validate required fields
  if (!budget.value || !duration.value || !location.value) {
    alert("Please fill in all required fields");
    return;
  }

  console.log("Budget:", budget.value);
  console.log("Duration:", duration.value);
  console.log("Location:", location.value);

  // Advance to next step (or navigate to next page)
  if (currentStep.value < 3) {
    currentStep.value++;
  } else {
    console.log("Form submitted!");
  }
};

// Initialize OpenStreetMap
onMounted(async () => {
  if (process.client) {
    // Dynamically import Leaflet on client to avoid SSR "window is not defined"
    const leaflet = await import("leaflet");
    const L = leaflet.default;

    // Fix Leaflet default icon paths
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      const mapElement = document.getElementById("map-container");
      if (mapElement && !map) {
        // Initialize map centered on Cork, Ireland
        map = L.map("map-container").setView([51.8985, -8.4756], 13);

        // Add OpenStreetMap tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        // Add a marker at Western Gateway Building, University College Cork
        L.marker([51.8985, -8.4756])
          .addTo(map)
          .bindPopup("Western Gateway Building<br>University College Cork")
          .openPopup();

        // Update location input when user clicks on map
        map.on("click", (e) => {
          const { lat, lng } = e.latlng;
          location.value = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

          // Remove previous marker and add new one at clicked location
          map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
              map.removeLayer(layer);
            }
          });

          L.marker([lat, lng])
            .addTo(map)
            .bindPopup(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
            .openPopup();
        });
      }
    }, 100);
  }
});

// Cleanup map on unmount
onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<style scoped>
.plan-page {
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

.topbar-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.home-btn,
.signout-btn {
  color: var(--color-text-light);
  border-color: rgba(255, 255, 255, 0.8);
}

.hero {
  margin: 24px;
  background: var(--color-primary);
  color: var(--color-text-light);
  border-radius: 14px;
  padding: 36px 28px 24px;
  text-align: center;
}

.hero-title {
  margin: 0 0 10px;
  font-weight: 800;
  font-size: clamp(24px, 4.5vw, 36px);
}

.hero-sub {
  margin: 0 0 24px;
  color: #e5e7eb;
  font-size: 16px;
}

.progress-bar {
  display: flex;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
}

.progress-filled {
  background: #f59e0b;
  transition: width 0.5s ease-in-out;
}

.progress-empty {
  flex: 1;
  background: rgba(255, 255, 255, 0.3);
}

.content {
  margin: 0 24px;
  background: var(--color-main-card-bg);
  border-radius: 14px;
  padding: 36px 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.content-header {
  text-align: center;
  margin-bottom: 32px;
}

.content-title {
  font-size: clamp(24px, 4vw, 32px);
  font-weight: 800;
  margin: 0 0 8px;
  color: var(--color-main-text);
}

.content-sub {
  font-size: 16px;
  color: #64748b;
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  margin-bottom: 32px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--color-main-text);
}

.form-input {
  width: 100%;
}

.form-hint {
  font-size: 13px;
  color: #64748b;
  margin: 6px 0 0;
}

.map-container {
  margin-top: 12px;
}

.map {
  width: 100%;
  height: 280px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-main-card-bg);
  border: 1px solid #e2e8f0;
}

.actions {
  display: flex;
  justify-content: center;
}

.continue-btn {
  background: #f59e0b;
  color: #fff;
  font-weight: 700;
  padding: 0 48px;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
