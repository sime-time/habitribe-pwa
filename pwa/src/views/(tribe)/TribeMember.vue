<script setup lang="ts">
import TabDock from "~/components/TabDock.vue";
import NavBar from "~/components/NavBar.vue";
import HabitCard from "~/components/habit/HabitCard.vue";
import LoadingSpinner from "~/components/LoadingSpinner.vue";
import { useRoute } from "vue-router";
import { useQuery } from "@tanstack/vue-query";
import { computed, ref } from "vue";
import { getLocalTimeZone, today } from "@internationalized/date";

// --- State Management ---

const route = useRoute();
const userId = route.query.userId;

// today's date in YYYY-MM-DD format
const date = today(getLocalTimeZone()).toString().slice(0, 10);

// this will hold the state of habits as they were last known by the server
const lastSavedHabits = ref<any[]>([]);


// --- Data Fetching (useQuery) ---
async function fetchTribeMemberData() {
  // fetch user data
  const userResponse = await fetch(
    `${import.meta.env.VITE_API_URL}/api/user/${userId}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!userResponse.ok) {
    throw new Error("Failed to fetch user data from server");
  }

  const userData = await userResponse.json();

  // fetch all the habit entries from this date
  const habitResponse = await fetch(
    `${import.meta.env.VITE_API_URL}/api/habit/entries/user/${userId}`,
    {
      method: "GET",
      credentials: "include", // must always include credentials
    }
  );

  if (!habitResponse.ok) {
    throw new Error("Failed to fetch habits from server");
  }

  const habitData = await habitResponse.json();

  const tribeMemberData = { ...userData, habits: habitData };

  lastSavedHabits.value = tribeMemberData;

  return tribeMemberData;
}

const { data, isLoading, isError, error, refetch } = useQuery({
  queryKey: ["tribe-member-data", userId],
  queryFn: async () => fetchTribeMemberData(),
});

const userImage = computed(() => {
  if (data.value.image) {
    return `${import.meta.env.VITE_R2_PUBLIC_URL}/${data.value.image}`
  }
  return "/blank-avatar.png";
});

</script>

<template>
  <div v-if="data">
    <nav-bar :back-button="true">{{ data.displayName }}</nav-bar>
  </div>
  <main class="flex flex-col items-center gap-8 mt-3 px-[1rem] mb-dock">
    <div class="avatar">
      <div class="ring-primary ring-offset-base-100 w-36 rounded-full ring-2 ring-offset-2">
        <img :src="userImage" />
      </div>
    </div>

    <div v-if="isLoading">
      <LoadingSpinner />
    </div>

    <div v-else-if="isError">Internal Server Error: {{ error?.message }}</div>

    <div
      v-else-if="data"
      class="grid grid-cols-1 gap-4 w-full"
    >
      <HabitCard
        v-for="habit in data.habits"
        :key="habit.id"
        :id="habit.id"
        :name="habit.name"
        :goal="habit.goalValue"
        :unit="habit.goalUnit"
        :progress="habit.progress"
        :image="habit.image"
        :date="date"
        :readonly="true"
      />
    </div>
  </main>
  <TabDock tab="tribe" />
</template>
