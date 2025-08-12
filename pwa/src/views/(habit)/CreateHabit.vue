<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import CreateHabitIcons from "~/components/habit/CreateHabitIcons.vue";
import NavBar from "~/components/NavBar.vue";
import { useToast } from "vue-toastification";
import { z } from "zod/v4";
import { useAuthStore } from "~/stores/auth-store";
import { storeToRefs } from "pinia";
import router from "~/router/index";
import { HabitSchema } from "@habitribe/shared-types";

// get the user id from auth store
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const habit = reactive({
  name: "",
  icon: "",
  goalValue: 0,
  goalUnit: "",
  reminderEnabled: false,
  reminderTime: "",
});

const week = reactive({
  sunday: { value: 0, enabled: true, label: "Su" },
  monday: { value: 1, enabled: true, label: "Mo" },
  tuesday: { value: 2, enabled: true, label: "Tu" },
  wednesday: { value: 3, enabled: true, label: "We" },
  thursday: { value: 4, enabled: true, label: "Th" },
  friday: { value: 5, enabled: true, label: "Fr" },
  saturday: { value: 6, enabled: true, label: "Sa" },
});

// returns true if all days in the week are enabled
const isEveryday = computed(() =>
  Object.values(week).every((day) => day.enabled),
);

function changeHabitIcon(icon: string) {
  habit.icon = icon;
}

const loading = ref(false);
const toast = useToast();

async function onSubmit() {
  loading.value = true;
  try {
    const type = isEveryday.value ? "daily" : "weekly";

    // loop through the week and add enabled days to the array
    const days: number[] = [];
    for (const day of Object.values(week)) {
      if (day.enabled) {
        days.push(day.value);
      }
    }

    // validate the input
    const validHabit = HabitSchema.parse({
      userId: user.value?.id,
      ...habit,
      schedule: {
        days: days,
      },
    });

    // insert the new habit into the database
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/habit/create`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validHabit),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to create habit on the server");
    }

    const result = await response.json();
    console.log("Habit created successfully", result);
    toast.success("New habit created!");

    // back to the main habits view
    router.push("/");
  } catch (error) {
    console.error("Error creating new habit", error);
    if (error instanceof z.ZodError) {
      toast.error(error.issues[0].message);
    } else {
      toast.error("Something went wrong");
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <nav-bar :back-button="true">
    New Habit
  </nav-bar>

  <main class="container mx-auto px-4 mt-3 mb-6">
    <form
      class="space-y-6"
      @submit.prevent="onSubmit"
    >
      <!-- Habit Name -->
      <fieldset class="card bg-base-200 p-4 space-y-1">
        <label class="text-sm opacity-50">Habit Name</label>
        <input
          v-model="habit.name"
          class="input input-sm input-ghost text-lg px-0"
          placeholder="e.g. Meditate"
        />
      </fieldset>

      <!-- Icon Select -->
      <!-- <fieldset class="card bg-base-200 p-4 space-y-2">
        <label class="text-sm opacity-50">Icon</label>
        <create-habit-icons @habit-icon-selected="changeHabitIcon" />
      </fieldset> -->

      <!-- Goal Value/Units -->
      <fieldset class="card bg-base-200 p-4 space-y-2">
        <label class="text-sm opacity-50">Goal</label>
        <div class="grid grid-cols-2 items-center justify-between">

          <input
            type="number"
            v-model="habit.goalValue"
            placeholder="0"
            class="input border-none text-lg"
          />

          <div class="tabs tabs-sm tabs-box justify-around">
            <input
              type="radio"
              name="goal-unit"
              class="tab [--tab-bg:var(--color-primary)]"
              aria-label="Minutes"
              value="minutes"
              v-model="habit.goalUnit"
            />
            <input
              type="radio"
              name="goal-unit"
              class="tab [--tab-bg:var(--color-primary)]"
              aria-label="Count"
              value="count"
              v-model="habit.goalUnit"
            />
          </div>
        </div>
      </fieldset>

      <!-- Set Reminder -->
      <fieldset class="card bg-base-200 p-4 space-y-2">
        <div class="flex justify-between items-center">
          <label class="text-lg">Reminders</label>
          <input
            type="checkbox"
            v-model="habit.reminderEnabled"
            class="toggle toggle-xl toggle-primary"
          />
        </div>

        <div
          v-if="habit.reminderEnabled"
          class="grid grid-cols-2 items-center"
        >
          <label class="text-lg">Time</label>
          <input
            type="time"
            class="input"
            v-model="habit.reminderTime"
          />
        </div>
      </fieldset>

      <!-- Set Schedule -->
      <fieldset class="card bg-base-200 p-4 space-y-2">
        <div class="flex justify-between items-center">
          <label class="text-lg">Schedule</label>
          <p class="opacity-50">{{ isEveryday ? "Everyday" : "Weekly" }}</p>
        </div>
        <div class="grid grid-cols-7 gap-2 mt-1">
          <template
            v-for="day in week"
            :key="day.value"
          >
            <input
              type="checkbox"
              :aria-label="day.label"
              v-model="day.enabled"
              :class="day.enabled ? 'bg-primary' : 'bg-base-100 opacity-50'"
              class="btn btn-circle text-neutral-content text-lg font-medium"
            />
          </template>
        </div>
      </fieldset>


      <button
        type="submit"
        class="btn btn-primary btn-xl text-lg btn-block text-neutral-content"
      >
        Create Habit
      </button>


    </form>
  </main>
</template>

<style lang="css" scoped>
/* make the toggle switch rounded */
.toggle {
  border-radius: 9999px;
}

.toggle:before {
  border-radius: 9999px;
}
</style>
