<script setup lang="ts">
import TabDock from "~/components/TabDock.vue";
import HabitNavBar from "~/components/habit/HabitNavBar.vue";
import HabitCard from "~/components/habit/HabitCard.vue";
import HabitTotalProgress from "~/components/habit/HabitTotalProgress.vue";
import LoadingSpinner from "~/components/LoadingSpinner.vue";
import { useAuthStore } from "~/stores/auth-store";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { useMutation, useQuery } from "@tanstack/vue-query";
import { computed, ref } from "vue";

// --- State Management ---

const route = useRoute();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

// this will hold the state of habits as they were last known by the server
const lastSavedHabits = ref<any[]>([]);
let debounceTimer: number | undefined;

// --- Computed Date from URL Query ---
const date = computed(() => {
  // get the date query (YYYY-MM-DD)
  const dateFromQuery = route.query.date;
  if (dateFromQuery && typeof dateFromQuery === "string") {
    return dateFromQuery;
  }

  // if no date query, create today's date in YYYY-MM-DD format
  return new Date().toISOString().slice(0, 10);
});

// --- Data Fetching (useQuery) ---

async function fetchUserHabitEntries(dateString: string) {
  // fetch all the habit entries from this date
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/habit/entries/user/${user.value?.id}?date=${dateString}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch habits from server");
  }

  // When data is fetched, create a deep copy for our snapshot.
  const fetchedData = await response.json();
  lastSavedHabits.value = JSON.parse(JSON.stringify(fetchedData));

  return fetchedData;
}

const { data, isLoading, isError, error, refetch } = useQuery({
  queryKey: ["habits", date.value],
  queryFn: async () => fetchUserHabitEntries(date.value),
});

// --- Data Mutation (useMutation) ---

const { mutate: mutateProgress } = useMutation({
  // update the progress of each habit entry
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
  onSuccess: (result, variables) => {
    // after a successful save, update our snapshot for the specific habit that was changed.
    const habitInSnapshot = lastSavedHabits.value.find(h => h.id === variables.habitId);
    if (habitInSnapshot) {
      habitInSnapshot.progress = variables.progress;
    }
  },
  onError: () => refetch(),
});


// this function is called by the debounced saver
function saveChanges() {
  if (!data.value || !lastSavedHabits.value) return;

  // compare current data with the saved state
  data.value.forEach((currentHabit: any) => {
    const savedHabit = lastSavedHabits.value.find((h: any) => h.id === currentHabit.id);

    // if progress is different, this habit needs to be updated
    if (savedHabit && currentHabit.progress !== savedHabit.progress) {
      mutateProgress({
        progress: currentHabit.progress,
        habitId: currentHabit.id,
        date: date.value,
      });
    }
  });
}

function updateProgress(newProgress: number, habitId: number) {
  // optimistic UI update
  if (!data.value) return;
  const habit = data.value.find((h: any) => h.id === habitId);
  if (habit) {
    habit.progress = newProgress;
  }

  // debounce the saveChanges function
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    saveChanges();
  }, 800); // milisecond delay
}

// --- UI Computed Properties ---
const totalProgress = computed(() => {
  if (!data.value || data.value.length === 0) {
    return 0;
  }

  let goalSum = 0;
  let progressSum = 0;
  for (let i = 0; i < data.value.length; i++) {
    goalSum += data.value[i].goalValue;
    // cap the contribution of each habit to the total progress calculation
    // this ensures that overachieving one habit doesn't inflate the overall percentage
    progressSum += Math.min(data.value[i].progress, data.value[i].goalValue);
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
    <HabitTotalProgress :percent="totalProgress" />

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
        @update-progress="updateProgress"
      />
    </div>
  </main>
  <TabDock tab="habits" />
</template>
