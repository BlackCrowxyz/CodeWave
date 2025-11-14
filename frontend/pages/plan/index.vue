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
              v-model.number="budget"
              variant="outlined"
              density="comfortable"
              type="number"
              min="0"
              hide-details="auto"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Duration (days)</label>
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

          <div class="form-group">
            <label class="form-label">Interests</label>
            <VSelect
              v-model="interests"
              :items="interestOptions"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              multiple
              chips
              class="form-input"
            />
            <p class="form-hint">Select your interests (you can choose multiple).</p>
          </div>
        </div>

        <!-- Right Column -->
        <div class="right-col">
          <div class="form-group">
            <div class="location-header">
              <label class="form-label">Current Location</label>
              <VBtn
                size="small"
                variant="outlined"
                @click="getCurrentLocation"
                :loading="gettingLocation"
                prepend-icon="mdi-crosshairs-gps"
                class="location-btn"
              >
                Use My Location
              </VBtn>
            </div>
            <VTextField
              v-model="location"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              class="form-input"
              placeholder="Click on map or use 'Use My Location' button"
              readonly
            />
            <p class="form-hint">Click on the map to set your location, or use the button to detect your current location.</p>
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
import { ref, computed, onMounted, onUnmounted } from 'vue';

// Protect this route - require authentication
definePageMeta({
  middleware: "auth",
});

const router = useRouter();
const { signout, isAuthenticated } = useAuth();

const budget = ref(0);
const duration = ref(null);
const location = ref("53.3498, -6.2603"); // Default to Dublin coordinates
const currentLocation = ref([53.3498, -6.2603]); // Default to Dublin [lat, lng]
const interests = ref([]);
const currentStep = ref(1);
const gettingLocation = ref(false);

let map = null;
let marker = null; // Store marker reference for proper removal

const durationOptions = [
  { title: "1 day", value: 1 },
  { title: "2 days", value: 2 },
  { title: "3 days", value: 3 },
  { title: "4 days", value: 4 },
  { title: "5 days", value: 5 },
  { title: "6 days", value: 6 },
  { title: "7 days", value: 7 },
];

const interestOptions = [
  "food",
  "sightseeing",
  "pubs",
  "nature",
  "history",
  "shopping",
  "entertainment",
  "sports",
  "culture",
  "adventure",
];

// Calculate progress percentage based on current step
const progressPercentage = computed(() => {
  return (currentStep.value / 3) * 100;
});

const goToHome = () => {
  router.push("/dashboard");
};

const handleSignOut = async () => {
  await signout();
};

const handleContinue = async () => {
  // Validate required fields
  if (!budget.value || budget.value <= 0 || !duration.value || !currentLocation.value || currentLocation.value.length !== 2) {
    alert("Please fill in all required fields: budget, duration, and location (click on map)");
    return;
  }

  // Store trip plan data in sessionStorage in the expected format
  if (process.client) {
    const tripPlanData = {
      budget: Number(budget.value),
      currentLocation: currentLocation.value,
      duration: Number(duration.value),
      interests: interests.value.length > 0 ? interests.value : [],
    };
    
    sessionStorage.setItem('tripPlan', JSON.stringify(tripPlanData));
  }

  // Navigate to recommendations page
  router.push("/recommend");
};

// Initialize map function
const initializeMap = async (centerCoords) => {
  if (!process.client) return;
  
  // Dynamically import Leaflet on client
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

  const mapElement = document.getElementById("map-container");
  if (!mapElement || map) return;

  // Initialize map centered on provided coordinates
  map = L.map("map-container").setView(centerCoords, 13);

  // Add OpenStreetMap tile layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  // Add initial marker at current location
  marker = L.marker(centerCoords)
    .addTo(map)
    .bindPopup("Your Location<br>Click on map to change")
    .openPopup();

  // Update location when user clicks on map
  map.on("click", (e) => {
    const { lat, lng } = e.latlng;
    updateLocation([lat, lng]);
  });
};

// Update location function
const updateLocation = async (coords) => {
  if (!map) return;
  
  const [lat, lng] = coords;
  currentLocation.value = [lat, lng];
  location.value = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

  // Import Leaflet if needed
  const leaflet = await import("leaflet");
  const L = leaflet.default;

  // Remove previous marker if it exists
  if (marker) {
    map.removeLayer(marker);
  }

  // Add new marker at clicked location
  marker = L.marker([lat, lng])
    .addTo(map)
    .bindPopup(`Your Location<br>${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    .openPopup();
  
  // Center map on new location
  map.setView([lat, lng], map.getZoom());
};

// Get user's current location
const getCurrentLocation = () => {
  if (!process.client || !navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  gettingLocation.value = true;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;
      
      if (map) {
        // Map already initialized, just update location
        updateLocation([userLat, userLng]);
      } else {
        // Map not initialized yet, update values and initialize
        currentLocation.value = [userLat, userLng];
        location.value = `${userLat.toFixed(4)}, ${userLng.toFixed(4)}`;
        initializeMap([userLat, userLng]);
      }
      
      gettingLocation.value = false;
    },
    (error) => {
      gettingLocation.value = false;
      let errorMessage = "Unable to get your location. ";
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage += "Please allow location access in your browser settings.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage += "Location information is unavailable.";
          break;
        case error.TIMEOUT:
          errorMessage += "Location request timed out.";
          break;
        default:
          errorMessage += "An unknown error occurred.";
          break;
      }
      alert(errorMessage);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
};

// Initialize OpenStreetMap and check authentication
onMounted(async () => {
  // Check authentication first
  if (!isAuthenticated()) {
    router.push("/signin");
    return;
  }
  
  if (process.client) {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      // Try to get user's current location first
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // User allowed geolocation
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            currentLocation.value = [userLat, userLng];
            location.value = `${userLat.toFixed(4)}, ${userLng.toFixed(4)}`;
            initializeMap([userLat, userLng]);
          },
          (error) => {
            // User denied or error getting location, use default
            console.log("Geolocation not available, using default location:", error);
            initializeMap(currentLocation.value);
          }
        );
      } else {
        // Geolocation not supported, use default
        initializeMap(currentLocation.value);
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

.location-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.location-btn {
  font-size: 12px;
  text-transform: none;
  height: 32px;
  padding: 0 12px;
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
