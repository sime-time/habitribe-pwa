<script setup lang="ts">
import NavBar from "~/components/NavBar.vue";
import TabDock from "~/components/TabDock.vue";
import HistoryCalendar from "~/components/HistoryCalendar.vue";
import { toCalendarDate, today, getLocalTimeZone } from "@internationalized/date";


// get today's date
const todayDate = toCalendarDate(today(getLocalTimeZone()));
</script>

<template>
  <NavBar title="Habit History" />
  <main class="flex flex-col items-center justify-center gap-8 mb-dock">
    <HistoryCalendar
      :date="todayDate"
      @date-selected="() => console.log('date selected')"
    />

  </main>
  <TabDock tab="stats" />
</template>
