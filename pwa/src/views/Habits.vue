<script setup lang="ts">
import TabDock from "~/components/TabDock.vue";
import HabitNavBar from "~/components/habit/HabitNavBar.vue";
import HabitCard from "~/components/habit/HabitCard.vue";
import HabitProgressTotal from "~/components/habit/HabitProgressTotal.vue";
import LoadingSpinner from "~/components/LoadingSpinner.vue";
import { useAuthStore } from "~/stores/auth-store";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { useMutation, useQuery } from "@tanstack/vue-query";
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

// fetch all the habit entries from this date
async function fetchUserHabitEntries(dateString: string) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/habit/entries/user/${user.value?.id}?date=${dateString}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch habits from server");
  }
  return await response.json();
}

const { data, isLoading, isError, error, refetch } = useQuery({
  queryKey: ["habits", date.value],
  queryFn: async () => fetchUserHabitEntries(date.value),
});

// update the progress of each habit entry
const { mutate: mutateProgress } = useMutation({
  mutationFn: (entry: { progress: number; habitId: number; date: string }) =>
    fetch(
      `${import.meta.env.VITE_API_URL}/api/habit/entries/update/${entry.habitId}`,
      {
        method: "POST",
        body: JSON.stringify({
          progress: entry.progress,
          date: entry.date,
        }),
      },
    ),
  onSuccess: () => refetch(),
});

function updateProgress(newProgress: number, habitId: number) {
  mutateProgress({
    progress: newProgress,
    habitId: habitId,
    date: date.value,
  });
}

// compute the overall progress of habits
const totalProgress = computed(() => {
  if (!data.value || data.value.length === 0) {
    return 0;
  }

  let goalSum = 0;
  let progressSum = 0;
  for (let i = 0; i < data.value.length; i++) {
    goalSum += data.value[i].goalValue;
    progressSum += data.value[i].progress;
  }

  if (goalSum === 0) {
    return 0;
  }

  const result = Math.round(progressSum / goalSum * 100);

  if (result > 100) {
    return 100;
  }

  return result;
});

</script>

<template>
  <HabitNavBar :date="date" />
  <main class="flex flex-col items-center gap-8 mt-12 px-[1rem] mb-dock">
    <HabitProgressTotal :percent="totalProgress" />

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
        :id="habit.id"
        :name="habit.name"
        :goal="habit.goalValue"
        :unit="habit.goalUnit"
        :progress="habit.progress"
        @increment-progress="updateProgress"
      />
    </div>
  </main>
  <TabDock tab="habits" />
</template>
