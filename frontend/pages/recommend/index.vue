<template>
  <div class="recommend">
    <!-- Top Header -->
    <header class="top-bar">
      <div class="brand">TripWave</div>
      <!-- Assuming VBtn is from Vuetify or a similar library -->
      <VBtn class="sign-out-btn" variant="outlined" @click="handleSignOut">Sign Out</VBtn>
    </header>

    {{ tripPlan.plan?.lat }}

    <!-- Your Trip Plan Module -->
    <section class="initial-inputs">
      <h1 class="title">Your Trip Plan</h1>
      <div class="trip-details" v-if="tripPlan.plan">
        <!-- Budget -->
        <div class="detail-item">
          <span class="emoji">💵</span>
          <div class="detail-content">
            <span class="detail-label">Budget</span>
            <span class="detail-value">€{{ tripPlan.plan.budget }}</span>
          </div>
        </div>
        <!-- Location -->
        <div class="detail-item">
          <span class="emoji">📍</span>
          <div class="detail-content">
            <span class="detail-label">Location</span>
            <!-- <span class="detail-value">{{ tripPlan.plan.currentLocation ? `${tripPlan.plan.currentLocation[0].toFixed(4)}, ${tripPlan.plan.currentLocation[1].toFixed(4)}` : 'Not set' }}</span> -->
            <span class="detail-value">
              {{ tripPlan.plan?.address?.split(',')[0] || 'Unknown Location' }}
            </span>
          </div>
        </div>
        <!-- Duration -->
        <div class="detail-item">
          <span class="emoji">🕐</span>
          <div class="detail-content">
            <span class="detail-label">Duration</span>
            <span class="detail-value"
              >{{ tripPlan.plan.duration }}
              {{ tripPlan.plan.duration === 1 ? 'day' : 'days' }}</span
            >
          </div>
        </div>
        <!-- Interests -->
        <div
          v-if="tripPlan.interests && tripPlan.interests.length > 0"
          class="detail-item"
        >
          <span class="emoji">🎯</span>
          <div class="detail-content">
            <span class="detail-label">Interests</span>
            <span class="detail-value">{{ tripPlan.interests.join(', ') }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- New: Recommended Places Module -->
    <section class="recommendations">
      <div class="recommendations-header">
        <h2 class="recommendations-title">Recommended Places</h2>
        <p class="recommendations-subtitle">Place that match your interests</p>
        <!-- "Powered by AI" (Optional, based on prototype) -->
        <span class="powered-by">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.203 3.419C12.83 2.568 11.17 2.568 10.797 3.419L9.136 7.46C9.01 7.747 8.747 7.94 8.441 7.973L4.132 8.412C3.208 8.52 2.857 9.68 3.53 10.316L6.64 13.22C6.86 13.427 6.96 13.738 6.903 14.04L6.002 18.244C5.79 19.15 6.78 19.82 7.575 19.39L11.21 17.4C11.48 17.253 11.789 17.253 12.059 17.4L15.694 19.39C16.489 19.82 17.479 19.15 17.267 18.244L16.366 14.04C16.309 13.738 16.409 13.427 16.629 13.22L19.739 10.316C20.412 9.68 20.06 8.52 19.136 8.412L14.827 7.973C14.522 7.94 14.259 7.747 14.128 7.46L13.203 3.419Z"
            />
          </svg>
          Powered by AI
        </span>
      </div>

      <!-- Loading State -->
      <!-- <div v-if="isLoading" class="loading-container">
        <p>Loading AI recommendations...</p>
      </div> -->

      <!-- Error State -->
      <VAlert
        v-if="errorMessage && !isLoading"
        type="error"
        variant="outlined"
        class="mb-4"
        :text="errorMessage"
      />

      <!-- Recommendations Content -->
      <!-- !isLoading && -->
      <div v-if="!errorMessage" class="content-layout">
        <!-- Left: Places List -->
        <div class="places-list">
          <div v-if="isLoading" class="loading-container">
            <p>
              <strong> Loading AI recommendations... </strong>
            </p>
          </div>
          <div
            v-else
            v-for="place in recommendedPlaces"
            :key="place.name"
            class="place-item"
            @click="
              drawer = !drawer;
              selectedPlace = place;
            "
          >
            <div class="place-info">
              <span class="place-name"
                >{{ place.name }}
                <!-- Optional: Star based on prototype -->
                <span v-if="place.featured">⭐</span>
              </span>
              <span class="place-type">{{ place.type }}</span>
              <span v-if="place.description" class="place-description">{{
                place.description
              }}</span>
            </div>
            <div class="place-meta">
              <span class="place-distance">{{ place.distance }}</span>
              <span v-if="place.estimatedCost" class="place-cost">{{
                place.estimatedCost
              }}</span>
            </div>
          </div>
        </div>

        <!-- Right: Map -->
        <div class="map-container">
          <div id="map-recommendations"></div>
        </div>
      </div>

      <v-navigation-drawer v-model="drawer" temporary location="right" width="500">
        <v-list-item :title="selectedPlace?.name"></v-list-item>

        <v-divider></v-divider>

        <v-list density="compact" nav>
          <v-list-item
            prepend-icon="mdi-tag"
            :title="selectedPlace?.type"
            value="Type"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-map-marker-distance"
            :title="selectedPlace?.distance"
            value="distance"
          ></v-list-item>
          <v-list-item
            v-if="selectedPlace?.estimatedCost"
            prepend-icon="mdi-currency-eur"
            :title="selectedPlace.estimatedCost"
            value="cost"
          ></v-list-item>
          <v-list-item
            v-if="selectedPlace?.description"
            :title="selectedPlace.description"
            value="description"
          ></v-list-item>
        </v-list>
      </v-navigation-drawer>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// Protect this route - require authentication
definePageMeta({
  middleware: 'auth',
});

const drawer = ref(false);
const selectedPlace = ref(null);

const router = useRouter();
const { signout, isAuthenticated } = useAuth();
const { getRecommendations } = useApi();

// Trip plan data
const tripPlan = ref({
  budget: 0,
  currentLocation: [51.897, -8.475],
  duration: 0,
  interests: [],
});

// Loading and error states
const isLoading = ref(false);
const errorMessage = ref('');

// Sign out handler
const handleSignOut = async () => {
  await signout();
};

// Recommended places
const recommendedPlaces = ref([]);

// Load trip plan from localStorage and fetch recommendations
onMounted(async () => {
  // Check authentication first
  if (!isAuthenticated()) {
    router.push('/signin');
    return;
  }

  // Get trip plan data from localStorage
  if (process.client) {
    const storedPlan = localStorage.getItem('tripPlan');
    if (storedPlan) {
      try {
        tripPlan.value = JSON.parse(storedPlan);
      } catch (e) {
        console.error('Error parsing trip plan:', e);
      }
    }
  }

  // Initialize map first
  await initializeMap();

  // Then fetch recommendations
  await fetchRecommendations();
});

// Fetch recommendations from API
const fetchRecommendations = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const { plan, interests } = tripPlan.value;

    const body = {
      budget: Number(plan.budget),
      duration: Number(plan.duration.replace(/\D+/g, '')),
      currentLocation: [plan.lat, plan.lon],
      interests: interests || [],
    };

    const response = await getRecommendations(
      body.budget,
      body.duration,
      body.currentLocation,
      body.interests
    );

    if (response.status === 200 && response.data) {
      recommendedPlaces.value = response.data.map((place) => ({
        name: place.name,
        type: place.type,
        description: place.description || '',
        estimatedCost: place.estimatedCost || 'Varies',
        distance: place.distance || 'Unknown',
        latlng: place.latlng || [51.897, -8.475],
        featured: place.featured || false,
      }));
    } else {
      errorMessage.value = response.message || 'Failed to load recommendations';
    }
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    const errorMsg =
      error instanceof Error
        ? error.message
        : 'Failed to load recommendations. Please try again.';
    errorMessage.value = errorMsg;
  } finally {
    isLoading.value = false;
  }
};

// Map instance reference
let map = null;

// Initialize map function
const initializeMap = async () => {
  if (process.client && !map) {
    // Dynamically import Leaflet
    const leaflet = await import('leaflet');
    const L = leaflet.default;

    // Fix Leaflet default icon paths
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    // Short delay to ensure DOM is ready
    setTimeout(() => {
      const mapElement = document.getElementById('map-recommendations');
      if (mapElement && !map) {
        // debugger;
        // Initialize map, centered on Cork
        map = L.map('map-recommendations').setView([51.893, -8.475], 1.5);

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        // Update map with recommendations
        updateMapMarkers();
      }
    }, 100);
  }
};

// Update map markers when recommendations change
const updateMapMarkers = async () => {
  if (!map || !recommendedPlaces.value.length) return;

  // Import Leaflet
  const leaflet = await import('leaflet');
  const L = leaflet.default;

  // Clear existing markers
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  const selectedLocation = tripPlan.value.plan;

  if (selectedLocation && selectedLocation.lat && selectedLocation.lon) {
    const customIcon = L.icon({
      iconUrl: 'https://openclipart.org/image/800px/192591',
      iconSize: [32, 32], // adjust to the actual/desired image size
      iconAnchor: [16, 32], // point of the icon which corresponds to marker location
      popupAnchor: [0, -32], // where the popup should open relative to the icon anchor
    });

    L.marker([selectedLocation.lat, selectedLocation.lon], {
      icon: customIcon,
      title: 'Selected Location',
    })
      .addTo(map)
      .bindPopup('<b>Your Selected Location</b>');
  }

  // Add markers for each recommended place
  recommendedPlaces.value.forEach((place) => {
    if (place.latlng && place.latlng.length === 2) {
      L.marker(place.latlng)
        .addTo(map)
        .bindPopup(
          `<b>${place.name}</b><br>${place.type}${
            place.estimatedCost ? '<br>' + place.estimatedCost : ''
          }`
        );
    }
  });

  // Adjust map view to include all markers if there are any
  if (recommendedPlaces.value.length > 0) {
    const validLatLngs = recommendedPlaces.value
      .filter((p) => p.latlng && p.latlng.length === 2)
      .map((p) => p.latlng);

    if (validLatLngs.length > 0) {
      const bounds = L.latLngBounds(validLatLngs);
      map.fitBounds(bounds.pad(0.1));
    }
  }
};

// Watch for changes in recommended places and update map
watch(
  recommendedPlaces,
  async () => {
    // console.log('Recommended places updated-:', recommendedPlaces.value, map);
    if (map && recommendedPlaces.value.length > 0) {
      // console.log('Recommended places updated:', recommendedPlaces.value);
      await updateMapMarkers();
    }
  },
  { deep: true }
);

// Destroy map on component unmount
onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<style scoped>
/* Import Leaflet CSS */
@import 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';

/* --- Keep your original styles --- */
.recommend {
  min-height: 100vh;
  background: var(--color-main-bg, #f4f7f6);
  padding-bottom: 40px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-primary, #007bff);
  color: var(--color-text-light, #ffffff);
  padding: 14px 24px;
}

.brand {
  font-weight: 800;
  font-size: clamp(24px, 4vw, 42px);
}

.sign-out-btn {
  color: var(--color-text-light, #ffffff);
  border-color: rgba(255, 255, 255, 0.8);
  --v-btn-color: var(--color-text-light, #ffffff);
  --v-btn-border-color: rgba(255, 255, 255, 0.8);
}

.initial-inputs {
  margin: 24px;
  background: var(--color-main-card-bg, #ffffff);
  border-radius: 14px;
  padding: 36px 28px 24px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.title {
  color: var(--color-main-text, #333);
  margin: 0 0 24px;
  font-weight: 800;
  font-size: clamp(24px, 4.5vw, 36px);
}

.trip-details {
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 24px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 120px;
  flex: 1;
  justify-content: center;
}

.emoji {
  font-size: 2.5rem;
  line-height: 1;
}

.detail-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.detail-label {
  font-size: 0.9rem;
  color: var(--color-main-text, #555);
  font-weight: 500;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 1.25rem;
  color: var(--color-main-text, #333);
  font-weight: 700;
}

/* --- Styles added below --- */

.recommendations {
  margin: 24px;
  padding: 32px 28px;
  background: var(--color-main-card-bg, #ffffff);
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.recommendations-header {
  text-align: center;
  margin-bottom: 28px;
  position: relative; /* For positioning "Powered by AI" */
}

.recommendations-title {
  color: var(--color-main-text, #222);
  font-weight: 800;
  font-size: clamp(22px, 4vw, 32px);
  margin: 0 0 8px;
}

.recommendations-subtitle {
  font-size: 1rem;
  color: var(--color-secondary-text, #667085);
  margin: 0;
}

.powered-by {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-main-text, #444);
}
/* Responsive: Hide "Powered by AI" on small screens */
@media (max-width: 600px) {
  .powered-by {
    display: none;
  }
}

.content-layout {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Two equal columns */
  gap: 24px;
}

.places-list {
  display: flex;
  flex-direction: column;
  gap: 16px; /* Gap between list items */
  overflow-y: auto; /* Allow scrolling if the list is too long */
  max-height: 450px; /* Limit max height, roughly aligning with the map */
}

.place-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.place-item:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.place-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.place-name {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-main-text, #333);
}

.place-name span {
  /* Star style */
  color: #f59e0b;
  font-size: 0.9rem;
  margin-left: 4px;
}

.place-type {
  font-size: 0.9rem;
  color: var(--color-secondary-text, #667085);
}

.place-description {
  font-size: 0.85rem;
  color: var(--color-secondary-text, #667085);
  margin-top: 4px;
  line-height: 1.4;
}

.place-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  margin-left: 16px;
}

.place-distance {
  font-weight: 600;
  font-size: 1rem;
  color: var(--color-main-text, #333);
  white-space: nowrap;
}

.place-cost {
  font-size: 0.85rem;
  color: var(--color-secondary-text, #667085);
  font-weight: 500;
}

.loading-container {
  text-align: center;
  padding: 40px;
  color: var(--color-main-text, #333);
}

.map-container {
  width: 100%;
  height: 450px; /* Define map container height */
  border-radius: 12px;
  overflow: hidden; /* Ensure map stays within rounded corners */
  border: 1px solid #e2e8f0;
}

#map-recommendations {
  width: 100%;
  height: 100%; /* Fill container */
  background-color: #f0f0f0; /* Background color before map loads */
}

/* Responsive adjustment: Stack vertically on small screens */
@media (max-width: 900px) {
  .content-layout {
    grid-template-columns: 1fr; /* Change to single column */
    gap: 28px;
  }

  .places-list {
    max-height: none; /* Remove max height limit */
    order: 2; /* Place list below the map */
  }

  .map-container {
    order: 1; /* Place map above the list */
    height: 350px; /* Reduce map height on mobile */
  }
}

@media (max-width: 600px) {
  .initial-inputs,
  .recommendations {
    margin: 16px;
    padding: 24px 20px;
  }

  .trip-details {
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  .detail-item {
    width: 100%;
    justify-content: center;
  }
}
.custom-red-marker .red-marker {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: red;
  border: 2px solid white;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
}
</style>
