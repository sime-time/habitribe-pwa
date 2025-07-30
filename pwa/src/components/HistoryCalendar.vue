<script setup lang="ts">
import type { DateValue } from "@internationalized/date";
import { haptic } from "~/plugins/haptic";
import { getLocalTimeZone, toCalendarDate, today } from "@internationalized/date";
import IconArrowLeft from "~icons/tabler/arrow-left";
import IconArrowRight from "~icons/tabler/arrow-right";
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
  date: DateValue;
}>();

// Tell Vue what events this component can "emit" (send out).
// Here, we say we can send an 'dateSelected' event,
// and it will come with a 'DateValue'.
const emit = defineEmits<{
  (e: "dateSelected", date: DateValue): void;
}>();

const locale = typeof navigator !== "undefined" ? navigator.language : "en-US";
const timeZone = getLocalTimeZone();
const todayDate: DateValue = toCalendarDate(today(timeZone));


// function that sends the date (emits the event) to the parent component
function selectDate(date: DateValue | undefined) {
  if (date) {
    emit("dateSelected", date);
  }
};
</script>

<template>
  <!-- The main container, manages state and provides data via v-slot -->
  <CalendarRoot
    v-slot="{ weekDays, grid }"
    :model-value="date"
    weekday-format="short"
    :locale="locale"
    :max-value="todayDate"
    class="inline-block w-full my-8 p-2"
    @update:model-value="selectDate"
  >
    <!-- Header section -->
    <CalendarHeader class="flex justify-between items-center mb-4">
      <CalendarPrev
        class="btn btn-circle"
        @click="haptic()"
      >
        <IconArrowLeft class="size-5" />
      </CalendarPrev>
      <CalendarHeading class="font-semibold text-lg" />
      <CalendarNext
        class="btn btn-circle"
        @click="haptic()"
      >
        <IconArrowRight class="size-5" />
      </CalendarNext>
    </CalendarHeader>

    <!-- Loop through each month provided by CalendarRoot's grid -->
    <CalendarGrid
      v-for="month in grid"
      :key="month.value.toString()"
      class="w-full text-xs md:text-base"
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
              <div
                class="flex items-center justify-center my-2"
                :class="cellProps.outsideView ? 'hidden' : ''"
              >
                <div
                  class="radial-progress border border-base-100"
                  :class="true ? 'text-success' : 'text-primary'"
                  :style="`--value:${10}; --size:2.4rem; --thickness:0.25rem`"
                  :aria-valuenow="10"
                  role="progressbar"
                >
                  <span class="font-semibold text-sm text-neutral-content">{{ cellProps.dayValue }}</span>
                </div>

              </div>
            </CalendarCellTrigger>
          </CalendarCell>
        </CalendarGridRow>
      </CalendarGridBody>
    </CalendarGrid>
  </CalendarRoot>
</template>
