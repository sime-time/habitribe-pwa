<script setup lang="ts">
import NavBar from "~/components/NavBar.vue";
import TabDock from "~/components/TabDock.vue";
import HistoryCalendar from "~/components/HistoryCalendar.vue";
import LoadingSpinner from "~/components/LoadingSpinner.vue";
import { today, getLocalTimeZone } from "@internationalized/date";
import { ref, computed } from "vue";
import { useQuery, keepPreviousData } from "@tanstack/vue-query";
import { useAuthStore } from "~/stores/auth-store";
import { storeToRefs } from "pinia";

// get the current user
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

// this will track the current month being displayed
const focusedDate = ref(today(getLocalTimeZone()));

// YYYY-MM
const monthQuery = computed(() => focusedDate.value.toString().slice(0, 7));

// fetch monthly data
const { data: dailyProgress, isLoading } = useQuery({
  queryKey: ["habitProgress", monthQuery],
  queryFn: async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/habit/progress/user/${user.value?.id}?month=${monthQuery.value}`);
    if (!response.ok) {
      throw new Error("Failed to fetch habit progress from server");
    }
    const data = await response.json();

    // convert the json object into a Map for efficient lookups
    return new Map(Object.entries(data));
  },
  // show old data while fetching new data (prevents UI flickers)
  placeholderData: keepPreviousData,
})


</script>

<template>
  <NavBar title="Habit History" />
  <main class="flex flex-col items-center justify-center gap-8 mb-dock">
    <div v-if="isLoading">
      <LoadingSpinner />
    </div>

    <HistoryCalendar
      v-else-if="dailyProgress"
      :focused-value="focusedDate"
      :daily-progress="dailyProgress"
    />
  </main>
  <TabDock tab="stats" />
</template>
