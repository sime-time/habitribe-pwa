<script setup lang="ts">
import { ref, reactive, computed, watchEffect } from "vue";
import NavBar from "~/components/NavBar.vue";
import { useToast } from "vue-toastification";
import { z } from "zod/v4";
import { useAuthStore } from "~/stores/auth-store";
import { storeToRefs } from "pinia";
import router from "~/router/index";
import { useRoute } from "vue-router";
import { HabitUpdateSchema } from "@habitribe/shared-types";
import { useQuery } from "@tanstack/vue-query";

// get the user id from auth store
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

// get the habit id from url query
const route = useRoute();
const habitId = route.query.id as string;

// --- Fetch Habit (useQuery) ---
async function fetchHabit(habitId: number) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/habit/${habitId}`,
    {
      method: "GET",
      credentials: "include"
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch habit");
  }
  const habitData = await response.json();
  return habitData;
}

const { data, isLoading, isError, error, refetch } = useQuery({
  queryKey: ["editHabit"],
  queryFn: async () => fetchHabit(Number(habitId)),
});

const habit = reactive({
  name: "",
  icon: "",
  goalValue: 0,
  goalUnit: "",
  reminderEnabled: false,
  reminderTime: "",
});

watchEffect(() => {
  if (data.value) {
    habit.name = data.value.name;
    habit.icon = data.value.icon;
    habit.goalValue = data.value.goalValue;
    habit.goalUnit = data.value.goalUnit;
    habit.reminderEnabled = data.value.reminderEnabled;
    habit.reminderTime = data.value.reminderTime;
  }
})

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
    const validHabit = HabitUpdateSchema.parse({
      ...habit,
      schedule: {
        days: days,
      },
    });

    // update the habit in the database
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/habit/update/${habitId}`,
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
      throw new Error("Failed to update habit on the server");
    }

    const result = await response.json();
    console.log("Habit updated successfully", result);
    toast.success("Habit updated!");

    // back to the main habits view
    router.push("/");
  } catch (error) {
    console.error("Error updating new habit", error);
    if (error instanceof z.ZodError) {
      toast.error(error.issues[0].message);
    } else {
      toast.error("Something went wrong");
    }
  } finally {
    loading.value = false;
  }
}

async function onDelete() {
  loading.value = true;
  try {
    // update the habit in the database
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/habit/delete/${habitId}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to delete habit on the server");
    }

    const result = await response.json();
    console.log("Habit deleted", result);
    toast.success("Habit deleted!");

    // back to the main habits view
    router.push("/");
  } catch (error) {
    console.error("Error deleting habit", error);
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
    Edit Habit
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
          class="input input-sm input-primary input-ghost text-lg px-0 w-full"
          placeholder="e.g. Meditate"
        />
      </fieldset>

      <section class="grid grid-cols-3 gap-5">

        <!-- Goal Value -->
        <fieldset class="card bg-base-200 p-4 space-y-2">
          <label class="text-sm opacity-50">Goal Value</label>
          <div class="grid grid-cols-1 items-center justify-between">

            <input
              type="number"
              v-model="habit.goalValue"
              placeholder="0"
              class="input border-none input-primary text-lg"
            />

          </div>
        </fieldset>

        <!-- Goal Units -->
        <fieldset class="card bg-base-200 p-4 space-y-2  col-span-2">
          <label class="text-sm opacity-50">Goal Unit</label>
          <div class="grid grid-cols-2 gap-y-3">
            <label class="flex items-center gap-2">
              <input
                type="radio"
                name="goal-unit"
                class="radio radio-primary"
                aria-label="Hours"
                value="hours"
                v-model="habit.goalUnit"
              />
              hours
            </label>

            <label class="flex items-center gap-2">
              <input
                type="radio"
                name="goal-unit"
                class="radio radio-primary"
                aria-label="Minutes"
                value="minutes"
                v-model="habit.goalUnit"
              />
              minutes
            </label>

            <label class="flex items-center gap-2">
              <input
                type="radio"
                name="goal-unit"
                class="radio radio-primary"
                aria-label="Pages"
                value="pages"
                v-model="habit.goalUnit"
              />
              pages
            </label>

            <label class="flex items-center gap-2">
              <input
                type="radio"
                name="goal-unit"
                class="radio radio-primary"
                aria-label="Count"
                value="count"
                v-model="habit.goalUnit"
              />
              count
            </label>

            <label class="flex items-center gap-1 col-span-2">
              <input
                type="radio"
                name="goal-unit"
                class="radio radio-primary"
                aria-label="Custom"
                value="custom"
              />
              <input
                type="text"
                v-model="habit.goalUnit"
                placeholder="other"
                class="input input-primary border-none input-xs text-base"
              />
            </label>
          </div>
        </fieldset>

      </section>

      <!-- Set Schedule -->
      <fieldset class="card bg-base-200 p-4 space-y-2">
        <div class="flex justify-between items-center">
          <label class="opacity-50">Schedule</label>
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
        Save Changes
      </button>

      <button
        type="button"
        class="btn btn-xl text-lg btn-block"
        @click="onDelete"
      >
        Delete Habit
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
