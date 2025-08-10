<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import NavBar from "~/components/NavBar.vue";
import { z } from "zod";
import { useAuthStore } from "~/stores/auth-store";
import { storeToRefs } from "pinia";
import router from "~/router/index";
import { TribeSchema } from "@habitribe/shared-types";
import { useToast } from "vue-toastification";

// get the user id to be the leader id
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const tribe = reactive({
  name: "",
  description: "",
});

const loading = ref(false);
const toast = useToast();

async function onSubmit() {
  loading.value = true;
  try {
    // validate the input
    const validTribe = TribeSchema.parse({
      name: tribe.name,
      description: tribe.description,
      leaderId: user.value?.id,
    });

    // insert the new tribe into the database
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/tribe/create`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validTribe),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create new tribe");
    }

    const result = await response.json();
    console.log("Tribe created succesfully", result);
    toast.success("New tribe created!");

    // back to the main tribe view
    router.push("/tribe");
  } catch (error) {
    console.error("Error creating new tribe", error);
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
    New Tribe
  </nav-bar>

  <main class="container mx-auto">
    <form
      class="space-y-6"
      @submit.prevent="onSubmit"
    >
      <!-- Tribe Name -->
      <fieldset class="card bg-base-200 p-4 space-y-1">
        <label class="text-sm opacity-50">Tribe Name</label>
        <input
          v-model="tribe.name"
          class="input input-sm input-ghost text-lg px-0"
          placeholder="My Tribe"
        />
      </fieldset>

      <!-- Description -->
      <fieldset class="card bg-base-200 p-4 space-y-1">
        <label class="text-sm opacity-50">Description</label>
        <input
          v-model="tribe.description"
          class="textarea textarea-sm textarea-ghost text-lg px-0"
          placeholder="Description"
        />
      </fieldset>

    </form>
  </main>


</template>
