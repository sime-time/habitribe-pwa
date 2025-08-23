<script setup lang="ts">
import NavBar from "~/components/NavBar.vue";
import TabDock from "~/components/TabDock.vue";
import IconTrophy from "~icons/tabler/trophy"
import IconBonfire from "~icons/solar/bonfire-broken";
import { useAuthStore } from "~/stores/auth-store";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { useToast } from "vue-toastification";
import IconUserPlus from "~icons/solar/user-plus-broken";
import IconGroup from "~icons/solar/users-group-two-rounded-broken"
import IconCopy from "~icons/tabler/copy";
import { RouterLink } from "vue-router";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL;
if (!r2PublicUrl) {
  console.error("VITE_R2_PUBLIC_URL is not set in your .env file.");
}

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
  const fetchedTribe = await response.json();

  return fetchedTribe;
}

async function fetchTribeMembers(tribeId: string) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/tribe/members/${tribeId}`,
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
  // Need to prepend the cloudflare r2 public url to the image string
  const fetchedUsers = fetchedData.map((u: any) => {
    if (u.image) {
      u.image = `${r2PublicUrl}/${u.image}`
    } else {
      u.image = "/blank-avatar.png"
    }
    return u;
  });

  return fetchedUsers;
}

const { data: tribe, isLoading: isTribeLoading, isError } = useQuery({
  queryKey: ["tribe"],
  queryFn: async () => fetchTribe(),
});

const { data: tribeMembers, isLoading: areMembersLoading } = useQuery({
  queryKey: ["tribeMembers", computed(() => tribe.value?.id)],
  queryFn: () => fetchTribeMembers(tribe.value!.id),
  // only enable when the tribe data is fetched first
  enabled: computed(() => !!tribe.value?.id),
});

// sort tribe members by habit completion rate
const sortedTribeMembers = computed(() => {
  if (!tribeMembers.value) {
    return [];
  }
  // sort by progress descending
  return [...tribeMembers.value].sort((a: any, b: any) => b.progress - a.progress);
});

// --- Copy Invite Code ---
const toast = useToast();
function copyInviteCode() {
  if (tribe.value?.inviteCode) {
    navigator.clipboard.writeText(tribe.value.inviteCode);
    toast.success("Copied Invite Code");
  }
}
</script>

<template>
  <NavBar>
    <h1 class="text-xl font-semibold text-neutral-content">Tribe</h1>
  </NavBar>

  <main class="flex flex-col items-center justify-center gap-8 mb-dock mt-3 ">
    <div
      v-if="!tribe || isError"
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
    </div>

    <div
      v-else
      class="flex flex-col gap-5 w-11/12"
    >
      <!-- TRIBE INFO -->
      <section class="card bg-base-200 flex flex-col justify-start items-start p-5 gap-2">
        <div class="flex items-center gap-2 text-xl">
          <IconBonfire />
          <h2 class="font-bold">{{ tribe.name }}</h2>
        </div>

        <p class="text-neutral-400">{{ tribe.description }}</p>

        <div class="flex items-center gap-2">
          <p class="text-neutral-400 text-xs">Leader:</p>
          <p>{{ tribe.leaderName }}</p>
        </div>

        <div class="flex items-center gap-2">
          <p class="text-neutral-400 text-xs">Invite:</p>
          <span>
            {{ tribe.inviteCode }}
          </span>
          <button @click="copyInviteCode">
            <IconCopy />
          </button>
        </div>
      </section>

      <!-- LEADERBOARD -->
      <section class="card bg-base-200 flex flex-col justify-between items-center p-5">
        <div class="flex w-full justify-between items-center">
          <div class="flex items-center gap-2 text-xl">
            <IconTrophy />
            <h2 class="font-bold">Leaderboard</h2>
          </div>

          <!-- <select class="select select-ghost select-sm text-primary flex w-fit text-end">
            <option selected>Today</option>
            <option>Past 7 days</option>
            <option>Past 30 days</option>
            <option>All time</option>
          </select> -->
          <p class="text-primary text-sm">Consistency</p>
        </div>

        <!-- List of Members -->
        <div
          v-if="tribeMembers"
          class="w-full mt-4"
        >
          <ul class="space-y-5">
            <li
              v-for="member in sortedTribeMembers"
              :key="member.id"
            >
              <router-link
                :to="`/tribe/member?userId=${member.id}`"
                class="flex items-center justify-between w-full"
              >

                <div class="flex items-center gap-3">
                  <!-- Avatar -->
                  <div class="avatar">
                    <div class="w-12 rounded-full">
                      <img :src="member.image" />
                    </div>
                  </div>
                  <!-- Display name -->
                  <p>{{ member.displayName }}</p>
                </div>

                <div>
                  <span>{{ member.progress }}%</span>
                </div>
              </router-link>
            </li>
          </ul>
        </div>

      </section>
    </div>
  </main>
  <TabDock tab="tribe" />
</template>
