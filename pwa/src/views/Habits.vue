<script setup lang="ts">
import TabDock from "~/components/TabDock.vue";
import HabitNavBar from "~/components/habit/HabitNavBar.vue";
import HabitCard from "~/components/habit/HabitCard.vue";
import HabitProgressTotal from "~/components/habit/HabitProgressTotal.vue";
import { useAuthStore } from "~/stores/auth-store";
import { storeToRefs } from "pinia";
import { useQuery } from "@tanstack/vue-query";
import LoadingSpinner from "~/components/LoadingSpinner.vue";

// get the user id from auth store
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

// fetch all the habits from this user
async function fetchUserHabits() {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/habit/user/${user.value?.id}`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch habits from server");
  }
  return response.json();
}

const { data, isLoading, isError, error } = useQuery({
  queryKey: ["habits"],
  queryFn: fetchUserHabits,
});
</script>

<template>
  <HabitNavBar />
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
        :progress="49"
      />
    </div>
  </main>
  <TabDock tab="habits" />
</template>
