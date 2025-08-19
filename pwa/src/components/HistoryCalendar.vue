<script setup lang="ts">
import type { DateValue } from "@internationalized/date";
import { haptic } from "~/plugins/haptic";
import { CalendarDate, getLocalTimeZone, toCalendarDate, today } from "@internationalized/date";
import { RouterLink } from "vue-router";
import { ref, useTemplateRef, computed } from "vue";
import IconArrowLeft from "~icons/tabler/arrow-left";
import IconArrowRight from "~icons/tabler/arrow-right";
import NavBar from "~/components/NavBar.vue";
import {
  CalendarCell,
  CalendarCellTrigger,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHead,
  CalendarGridRow,
  CalendarHeadCell,
  CalendarHeader,
  CalendarHeading,
  CalendarNext,
  CalendarPrev,
  CalendarRoot,
} from "reka-ui";

const props = defineProps<{
  dailyProgress: Map<string, number>;
  initialMonth?: string;
}>();

const initialMonthToDate = computed(() => {
  if (props.initialMonth) {
    const [year, month] = props.initialMonth.split("-").map(Number);
    return new CalendarDate(year, month, 1);
  }
})

const locale = typeof navigator !== "undefined" ? navigator.language : "en-US";
const timeZone = getLocalTimeZone();
const todayDate: DateValue = toCalendarDate(today(timeZone));

function isToday(date: DateValue) {
  return date.compare(todayDate) === 0;
}

function getProgressForDate(date: DateValue) {
  const dateString = date.toString();
  return props.dailyProgress.get(dateString) ?? 0;
}

function getProgressColor(date: DateValue) {
  const dateString = date.toString();
  const progress = props.dailyProgress.get(dateString) ?? 0;

  let classStr: string = "";

  if (progress >= 100) {
    classStr = "text-success";
  } else if (progress <= 0) {
    classStr = "text-transparent";
  } else {
    classStr = "text-primary";
  }

  if (isToday(date)) {
    classStr = classStr.concat(" ", "bg-neutral-content")
  }
  return classStr;
}

function formatDate(date: DateValue) {
  // format date to YYYY-MM-DD
  const year = date.year
  const month = date.month.toString().padStart(2, "0");
  const day = date.day.toString().padStart(2, "0");

  return `${year}-${month}-${day}`
}

// --- Handle Month Changes ---
const calendarRef = useTemplateRef("calendarRef");
const focusedDate = ref(toCalendarDate(today(getLocalTimeZone())));

// emit the focused month to the parent
// so the parent can fetch the correct data
const emit = defineEmits(["month-update"]);

function handleMonthUpdate() {
  const year = focusedDate.value.year
  const month = focusedDate.value.month.toString().padStart(2, "0");
  emit("month-update", `${year}-${month}`);
}

function nextMonth() {
  haptic();
  focusedDate.value = focusedDate.value.add({ months: 1 }).copy();
  handleMonthUpdate();
}
function prevMonth() {
  haptic();
  focusedDate.value = focusedDate.value.subtract({ months: 1 }).copy();
  handleMonthUpdate();
}

</script>

<template>
  <!-- The main container, manages state and provides data via v-slot -->
  <CalendarRoot
    ref="calendarRef"
    v-slot="{ weekDays, grid }"
    weekday-format="narrow"
    :locale="locale"
    :max-value="todayDate"
    :placeholder="initialMonthToDate"
    class="inline-block w-full"
  >
    <!-- Header section -->
    <CalendarHeader class="flex justify-center items-center mb-4">
      <NavBar>
        <CalendarHeading class="text-xl font-semibold" />
      </NavBar>
    </CalendarHeader>

    <!-- Loop through each month provided by CalendarRoot's grid -->
    <CalendarGrid
      v-for="month in grid"
      :key="month.value.toString()"
      class="max-w-screen  text-xs md:text-base mx-auto"
    >

      <!-- Loop through weekday names provided by CalendarRoot -->
      <CalendarGridHead>
        <CalendarGridRow class="text-sm text-neutral-400 font-medium">
          <CalendarHeadCell
            v-for="day in weekDays"
            :key="day"
          >
            {{ day }}
          </CalendarHeadCell>
        </CalendarGridRow>
      </CalendarGridHead>

      <CalendarGridBody>
        <!-- Loop through each week in the current month -->
        <CalendarGridRow
          v-for="(weekDates, index) in month.rows"
          :key="`week-${index}`"
        >
          <!-- Loop through each day in the current week -->
          <CalendarCell
            v-for="weekDate in weekDates"
            :key="weekDate.toString()"
            :date="weekDate"
          >
            <!-- The clickable part of the cell -->
            <CalendarCellTrigger
              v-slot="cellProps"
              :day="weekDate"
              :month="month.value"
              @click="haptic()"
            >
              <RouterLink
                :to="`/?date=${formatDate(weekDate)}`"
                class="flex items-center justify-center my-2 mx-1"
                :class="cellProps.outsideView ? 'hidden' : ''"
              >
                <!-- Day Radial Progress -->
                <div
                  class="radial-progress border border-base-100 font-semibold text-sm"
                  :class="getProgressColor(weekDate)"
                  :style="`--value:${getProgressForDate(weekDate)}; --size:2.6rem; --thickness:0.30rem`"
                  role="progressbar"
                >
                  <span :class="isToday(weekDate) ? 'text-neutral' : 'text-neutral-content'">
                    {{ cellProps.dayValue }}
                  </span>
                </div>

              </RouterLink>
            </CalendarCellTrigger>
          </CalendarCell>
        </CalendarGridRow>
      </CalendarGridBody>
    </CalendarGrid>

    <div class="flex items-center justify-evenly mt-4">
      <CalendarPrev
        class="btn btn-circle btn-lg"
        @click="prevMonth()"
      >
        <IconArrowLeft class="size-5" />
      </CalendarPrev>
      <CalendarNext
        class="btn btn-circle btn-lg"
        @click="nextMonth()"
      >
        <IconArrowRight class="size-5" />
      </CalendarNext>
    </div>
  </CalendarRoot>


</template>
