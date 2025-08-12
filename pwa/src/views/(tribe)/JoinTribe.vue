<script setup lang="ts">
import NavBar from "~/components/NavBar.vue";
import { ref } from "vue";
import { useToast } from "vue-toastification";
import { useAuthStore } from "~/stores/auth-store";
import { storeToRefs } from "pinia";
import { TribeInviteSchema } from "@habitribe/shared-types";
import { ZodError } from "zod";
import router from "~/router";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const code = ref("");
const loading = ref(false);
const toast = useToast();

async function onSubmit() {
  loading.value = true;
  try {
    // validate the input
    const validInvite = TribeInviteSchema.parse({
      userId: user.value?.id,
      inviteCode: code.value,
    });

    // add the user to the tribe
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/tribe/join`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validInvite),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to join tribe");
    }

    const tribe = await response.json();
    console.log("Tribe joined succesfully", tribe);

    toast.success(`Joined ${tribe.name}`);

    router.push("/tribe");

  } catch (error) {
    console.error("Error joining tribe", error);
    if (error instanceof ZodError) {
      toast.error(error.issues[0].message);
    } else {
      toast.error("Invalid Invite Code");
    }
  } finally {
    loading.value = false;
  }
}



</script>

<template>
  <nav-bar :back-button="true">
    Join a Tribe
  </nav-bar>
  <main class="flex flex-col items-center justify-center px-5">

    <h1 class="text-neutral-content text-4xl font-semibold mt-32">Invite Code</h1>
    <p class="text-center mb-6 mt-2">
      Use a 6-digit invite code to join a tribe
    </p>

    <!-- FORM CONTAINER -->
    <form
      class="fieldset space-y-3"
      @submit.prevent="onSubmit"
    >

      <!-- VERIFICATION CODE INPUT -->
      <input
        v-model="code"
        type="input"
        class="input input-lg text-center"
        placeholder="XXXXXX"
      />

      <!-- VERIFY BUTTON -->
      <button
        type="submit"
        class="btn btn-lg btn-primary"
        :disabled="loading"
      >
        <span v-if="loading">Joining...</span>
        <span v-else>Join Tribe</span>
      </button>
    </form>
  </main>
</template>
