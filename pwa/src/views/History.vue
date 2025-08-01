<script setup lang="ts">
import TabDock from "~/components/TabDock.vue";
import HistoryCalendar from "~/components/HistoryCalendar.vue";
import LoadingSpinner from "~/components/LoadingSpinner.vue";
import router from "~/router";
import { computed } from "vue";
import { useQuery, keepPreviousData } from "@tanstack/vue-query";
import { useAuthStore } from "~/stores/auth-store";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { today, getLocalTimeZone } from "@internationalized/date";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const route = useRoute();

// --- Computed Month from URL Query ---
const monthQuery = computed(() => {
  // get the month query (YYYY-MM)
  const month = route.query.month;
  if (month && typeof month === "string") {
    return month;
  }

  // if no month query, create today's date in YYYY-MM format
  return today(getLocalTimeZone()).toString().slice(0, 7);
});

// --- Fetch Progress Data ---
const { data: dailyProgress, isLoading } = useQuery({
  queryKey: ["habitProgress", monthQuery],
  queryFn: async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/habit/progress/user/${user.value?.id}?month=${monthQuery.value}`);
    if (!response.ok) {
      throw new Error("Failed to fetch habit progress from server");
    }
    const data = await response.json();

    // convert the json object into a Map for efficient lookups
    return new Map<string, number>(Object.entries(data));
  },
  // show old data while fetching new data (prevents UI flickers)
  placeholderData: keepPreviousData,
});

// refetch data when month query changes in the url
function handleMonthUpdate(newMonth: string) {
  router.push({ query: { month: newMonth } });
}

</script>

<template>
  <main class="flex flex-col items-center justify-center gap-8 mb-dock">
    <div v-if="isLoading">
      <LoadingSpinner />
    </div>

    <HistoryCalendar
      v-else-if="dailyProgress"
      :daily-progress="dailyProgress"
      :initial-month="monthQuery"
      @month-update="handleMonthUpdate"
    />
  </main>
  <TabDock tab="stats" />
</template>
