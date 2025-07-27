<script setup lang="ts">
import TabDock from "~/components/TabDock.vue";
import HabitNavBar from "~/components/habit/HabitNavBar.vue";
import HabitCard from "~/components/habit/HabitCard.vue";
import HabitProgressTotal from "~/components/habit/HabitProgressTotal.vue";
import LoadingSpinner from "~/components/LoadingSpinner.vue";
import { useAuthStore } from "~/stores/auth-store";
import { storeToRefs } from "pinia";
import { useQuery } from "@tanstack/vue-query";
import { useRoute } from "vue-router";
import { computed } from "vue";

// get the user id from auth store
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

// get the date query (YYYY-MM-DD)
const route = useRoute();
const date = computed(() => {
  const dateFromQuery = route.query.date;
  if (dateFromQuery && typeof dateFromQuery === "string") {
    return dateFromQuery;
  }

  // if no date query, create today's date in YYYY-MM-DD format
  return new Date().toISOString().slice(0, 10);
});

// fetch all the habits from this date
async function fetchUserHabitEntries(dateString: string) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/habit/user/${user.value?.id}/entries?date=${dateString}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch habits from server");
  }

  return await response.json();
}

const { data, isLoading, isError, error } = useQuery({
  queryKey: ["habits", date.value],
  queryFn: async () => fetchUserHabitEntries(date.value),
});
</script>

<template>
  <HabitNavBar :date="date" />
  <main class="flex flex-col items-center gap-8 mt-12 px-[1rem] mb-dock">
    <HabitProgressTotal :percent="62" />

    <div v-if="isLoading">
      <LoadingSpinner />
    </div>

    <div v-else-if="isError">Internal Server Error: {{ error?.message }}</div>

    <div
      v-else-if="data"
      class="grid grid-cols-1 gap-4 w-full"
    >
      <HabitCard
        v-for="habit in data"
        :key="habit.id"
        :name="habit.name"
        :value="habit.goalValue"
        :unit="habit.goalUnit"
        :progress="habit.progress"
      />
    </div>
  </main>
  <TabDock tab="habits" />
</template>
