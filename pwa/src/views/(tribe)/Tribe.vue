<script setup lang="ts">
import NavBar from "~/components/NavBar.vue";
import TabDock from "~/components/TabDock.vue";
import IconTrophy from "~icons/tabler/trophy"
import IconBonfire from "~icons/solar/bonfire-broken";
import { useAuthStore } from "~/stores/auth-store";
import { storeToRefs } from "pinia";
import { useQuery } from "@tanstack/vue-query";
import IconUserPlus from "~icons/solar/user-plus-broken";
import IconGroup from "~icons/solar/users-group-two-rounded-broken"

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

// --- Data Fetching (useQuery) ---
async function fetchTribe() {
  // check if the user is in a tribe
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/tribe/${user.value?.id}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!response.ok) {
    return null;
  }

  // When data is fetched, create a deep copy for our snapshot.
  const fetchedData = await response.json();

  return fetchedData;
}

const { data, isLoading, isError, error, refetch } = useQuery({
  queryKey: ["tribe"],
  queryFn: async () => fetchTribe(),
});

</script>

<template>
  <NavBar>
    <h1 class="text-xl font-semibold text-neutral-content">Tribe</h1>
  </NavBar>

  <main class="flex flex-col items-center justify-center gap-8 mb-dock mt-3 ">
    <section
      v-if="!data || isError"
      class="flex flex-col sm:flex-row gap-8 mt-16"
    >
      <router-link
        to="/tribe/join"
        class="btn btn-xl bg-base-100"
      >
        <icon-user-plus />
        Join Tribe
      </router-link>
      <router-link
        to="/tribe/create"
        class="btn btn-xl bg-base-100 "
      >
        <icon-group />
        Create Tribe
      </router-link>
    </section>
    <section v-else>
      <p>{{ data }}</p>
      <div class="card bg-base-200 flex flex-row justify-between items-center">
        <IconBonfire />
        <h2>Tribe Name</h2>
      </div>
      <div class="card bg-base-200 flex flex-row justify-between items-center">
        <IconTrophy />
        <h2>Leaderboard</h2>
      </div>
    </section>
  </main>
  <TabDock tab="tribe" />
</template>
