<script setup lang="ts">
import NavBar from "~/components/NavBar.vue";
import TabDock from "~/components/TabDock.vue";
import IconTrophy from "~icons/tabler/trophy"
import IconBonfire from "~icons/solar/bonfire-broken";
import { useAuthStore } from "~/stores/auth-store";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { useToast } from "vue-toastification";
import IconUserPlus from "~icons/solar/user-plus-broken";
import IconGroup from "~icons/solar/users-group-two-rounded-broken"
import IconCopy from "~icons/tabler/copy";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const leaderAvatarUrl = ref<string | null>(null);

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

  const r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL;
  if (!r2PublicUrl) {
    console.error("VITE_R2_PUBLIC_URL is not set in your .env file.");
  }

  leaderAvatarUrl.value = `${r2PublicUrl}/${fetchedData.leaderImage}`

  return fetchedData;
}

const { data, isLoading, isError, error, refetch } = useQuery({
  queryKey: ["tribe"],
  queryFn: async () => fetchTribe(),
});

// --- Copy Invite Code ---
const toast = useToast();
function copyInviteCode() {
  if (data.value?.inviteCode) {
    navigator.clipboard.writeText(data.value.inviteCode);
    toast.success("Copied Invite Code");
  }
}
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
    <section
      v-else
      class="flex flex-col gap-5 w-11/12"
    >
      <div class="card bg-base-200 flex flex-col justify-start items-start p-5 gap-2">
        <div class="flex items-center gap-2 text-xl">
          <IconBonfire />
          <h2 class="font-bold">{{ data.name }}</h2>
        </div>

        <p class="text-neutral-400">{{ data.description }}</p>

        <div class="flex items-center gap-2">
          <p class="text-neutral-400 text-xs">Leader:</p>
          <p>{{ data.leaderName }}</p>
        </div>

        <div class="flex items-center gap-2">
          <p class="text-neutral-400 text-xs">Invite:</p>
          <span>
            {{ data.inviteCode }}
          </span>
          <button @click="copyInviteCode">
            <IconCopy />
          </button>
        </div>



      </div>

      <div class="card bg-base-200 flex flex-row justify-between items-center p-5">
        <div class="flex w-full justify-between">
          <div class="flex items-center gap-2 text-xl">
            <IconTrophy />
            <h2 class="font-bold">Leaderboard</h2>
          </div>

          <select class="select select-ghost select-sm text-primary flex w-fit">
            <option selected>Today</option>
            <option>Past 7 days</option>
            <option>Past 30 days</option>
            <option>All time</option>
          </select>
        </div>
      </div>
    </section>
  </main>
  <TabDock tab="tribe" />
</template>
