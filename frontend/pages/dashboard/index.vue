<template>
  <div class="dashboard">
    <header class="topbar">
      <div class="brand">TripWave</div>
      <VBtn class="signout-btn" variant="outlined" @click="handleSignOut">
        Sign Out
      </VBtn>
    </header>

    <section class="content">
      <h1>Welcome to TripWave</h1>
      <p>Plan your perfect Irish adventure</p>
      <VBtn class="primary-btn" size="large" @click="startPlanning">
        Start Planning
      </VBtn>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

// Protect this route - require authentication
definePageMeta({
  middleware: "auth",
});

const router = useRouter();
const { signout, isAuthenticated } = useAuth();

// Check authentication on mount
onMounted(() => {
  if (!isAuthenticated()) {
    router.push("/signin");
  }
});

const startPlanning = () => {
  router.push("/plan");
};

const handleSignOut = async () => {
  await signout();
};
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: var(--color-main-bg);
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
  font-size: 24px;
}

.signout-btn {
  color: var(--color-text-light);
  border-color: rgba(255, 255, 255, 0.8);
}

.content {
  padding: 60px 24px;
  text-align: center;
}

.content h1 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 16px;
  color: var(--color-main-text);
}

.content p {
  font-size: 16px;
  color: #64748b;
  margin: 0 0 40px;
}

.primary-btn {
  background: var(--color-primary);
  color: var(--color-text-light);
  padding: 0 48px;
  font-weight: 700;
}
</style>
