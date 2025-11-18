<template>
  <div class="interests-page">
    <header class="topbar">
      <div class="brand">TripWave</div>
      <div class="user-email">{{ userEmail }}</div>
    </header>

    <section class="hero">
      
        <h1 class="hero-title">Plan Your Ireland Adventure</h1>
        <p class="hero-sub">Let's start with your budget, duration and location</p>

        <div class="progress-bar">
        <div
          class="progress-filled"
          :style="{ width: '60%' }"
        ></div>
        <div class="progress-empty"></div>
      </div>
    </section>

    <section class="content">
      <div class="content-card">
        <h2 class="content-title">Your Interests</h2>
        <p class="content-sub">Select activities you'd like to experience</p>

        <div class="interests-grid">
          <VBtn
            v-for="opt in interestOptions"
            :key="opt.id"
            variant="outlined"
            :class="['interest-tile', { selected: isSelected(opt.id) }]"
            @click="toggle(opt.id)"
          >
            <div class="tile-inner">
              <span class="tile-emoji" aria-hidden="true">{{ opt.emoji }}</span>
              <span class="tile-label" :class="{ selected: isSelected(opt.id) }">{{ opt.label }}</span>
            </div>
          </VBtn>
        </div>

        <div class="actions">
          <VBtn class="submit-btn" size="large" @click="submit">Submit</VBtn>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const router = useRouter()
const userEmail = ref('')
const tripPlan = ref(null)

const interestOptions = [
  { id: 'camping', label: 'Camping', emoji: '⛺' },
  { id: 'restaurants', label: 'Restaurants', emoji: '🍽️' },
  { id: 'movies', label: 'Movies', emoji: '🎬' },
  { id: 'music', label: 'Musics', emoji: '🎵' },
  { id: 'pubs', label: 'Pubs', emoji: '🍺' },
  { id: 'hiking', label: 'Hiking', emoji: '🥾' },
  { id: 'beaches', label: 'Beaches', emoji: '🏖️' },
  { id: 'photography', label: 'Photography', emoji: '📷' },
  { id: 'shopping', label: 'Shopping', emoji: '🛒' },
  { id: 'churches', label: 'Churches', emoji: '⛪' },
]

const selected = ref([])

onMounted(() => {
  if (process.client) {
    userEmail.value = localStorage.getItem('userEmail') || ''
    try {
      const existing = JSON.parse(localStorage.getItem('planInterests') || '[]')
      if (Array.isArray(existing)) selected.value = existing
    } catch {}
    try {
      const tp = JSON.parse(localStorage.getItem('tripPlan') || 'null')
      tripPlan.value = tp
    } catch {}
  }
})

const isSelected = (id) => selected.value.includes(id)

const toggle = (id) => {
  if (isSelected(id)) {
    selected.value = selected.value.filter(x => x !== id)
  } else {
    selected.value = [...selected.value, id]
  }
}

const submit = () => {
  if (process.client) {
    // merge into single key 'tripPlan'
    let existing = null
    try { existing = JSON.parse(localStorage.getItem('tripPlan') || 'null') } catch {}
    const base = existing || {}
    const next = {
      ...base,
      interests: Array.isArray(selected.value) ? [...selected.value] : [],
      updatedAt: new Date().toISOString(),
    }


    localStorage.setItem('tripPlan', JSON.stringify(next))
  }
  router.push("/recommend");
}
</script>

<style scoped>
.interests-page {
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
.user-email {
  opacity: 0.9;
}
.hero {
  margin: 24px;
  background: var(--color-primary);
  color: var(--color-text-light);
  border-radius: 14px;
  padding: 36px 28px 24px;
  text-align: center;
  margin-bottom: 24px; /* explicit spacing below hero */
}

.hero-title {
  font-size: clamp(22px, 3vw, 34px);
  margin: 0;
  font-weight: 800;
  color: #fff;
}

.hero-sub {
  margin: 6px 0 16px;
  color: rgba(255,255,255,0.9);
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
  padding: 16px 24px;
  margin-top: 24px; /* extra space below hero */
}
.content-card {
  background: var(--color-card-bg, #fff);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  text-align: center;
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
.interests-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(160px, 1fr));
  gap: 16px;
  margin-top: 16px;
}
@media (max-width: 900px) {
  .interests-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 600px) {
  .interests-grid { grid-template-columns: repeat(2, 1fr); }
}
.interest-tile {
  display: flex; /* make button a flex box */
  justify-content: center;
  align-items: center;
  border-width: 2px;
  border-color: rgba(0,0,0,0.15);
  border-radius: 12px;
  background: var(--color-main-card-bg);
  text-align: center;
  min-height: 150px; /* give more breathing room */
  padding: 0;
  box-sizing: border-box;
}
.interest-tile.selected {
  border-color: #f6a21a; /* orange */
  box-shadow: 0 0 0 2px rgba(246, 162, 26, 0.2) inset;
}
.interest-tile :deep(.v-btn) {
  min-width: 0 !important; /* remove Vuetify default min-width */
  min-height: 0 !important; /* remove Vuetify default min-height */
  width: 100% !important;
  height: 100% !important;
  padding: 0 !important; /* remove inner padding */
}
.interest-tile :deep(.v-btn__content) {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0; /* remove extra inner padding */
}
.tile-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0 12px;
}
.tile-emoji { font-size: 38px; line-height: 1; }
@media (max-width: 600px) {
  .tile-emoji { font-size: 34px; }
}
.tile-label {
  font-weight: 700;
  text-align: center;
  max-width: 100%;
  white-space: normal; /* allow wrapping if needed */
  line-height: 1.15;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 2;
}
.tile-label.selected { color: #f6a21a; }
.actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
.submit-btn {
  background: #f6a21a; /* orange */
  color: #fff;
  font-weight: 700;
  padding: 8px 22px;
  border-radius: 10px;
}
</style>
