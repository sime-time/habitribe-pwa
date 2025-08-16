<script setup lang="ts">
import { computed, ref } from "vue";
import NavBar from "~/components/NavBar.vue";
import { useAuthStore } from "~/stores/auth-store";

const authStore = useAuthStore();
const isLoading = ref(false);

// Constructs the full avatar URL from the key stored in the database.
// It requires the public URL of your R2 bucket from environment variables.
const avatarUrl = computed(() => {
  if (authStore.user?.image) {
    const r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL;
    // Ensure the public URL is set, otherwise, the image won't load.
    if (!r2PublicUrl) {
      console.error("VITE_R2_PUBLIC_URL is not set in your .env file.");
      return "https://img.daisyui.com/images/profile/demo/batperson@192.webp";
    }
    return `${r2PublicUrl}/${authStore.user.image}`;
  }
  // Return a default placeholder image if the user has no avatar.
  return "https://img.daisyui.com/images/profile/demo/batperson@192.webp";
});

async function uploadFile(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  // Guard clauses to ensure we have a file and a logged-in user.
  if (!file || !authStore.user) return;

  isLoading.value = true;
  try {
    // Step 1: Get the pre-signed URL from your backend.
    // We send the file's content type and the user's ID.
    const presignResponse = await fetch("/api/upload/avatar/url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentType: file.type,
        userId: authStore.user.id,
      }),
    });
    const { uploadUrl, key } = await presignResponse.json();

    // Step 2: Upload the file directly to R2 using the pre-signed URL.
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    // Step 3: Update the user's profile with the new avatar URL key.
    // This tells our database where the new image is.
    await fetch("/api/upload/avatar/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: key,
        userId: authStore.user.id,
      }),
    });

    // Step 4: Update the local state to show the new avatar immediately.
    authStore.user.image = key;
  } catch (error) {
    console.error("Failed to upload avatar:", error);
    // Here you could show an error message to the user.
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <nav-bar :back-button="true">Profile</nav-bar>
  <main class="container mx-auto px-4 mt-3 mb-6">
    <form class="space-y-6">
      <!-- Username -->
      <fieldset class="card bg-base-200 p-4 space-y-1">
        <label class="text-sm opacity-50">Username</label>
        <input
          v-if="authStore.user"
          v-model="authStore.user.username"
          class="input input-sm input-ghost text-lg px-0"
          placeholder="Your public name"
        />
      </fieldset>

      <!-- Avatar -->
      <fieldset class="card bg-base-200 p-4 space-y-2">
        <label class="text-sm opacity-50">Avatar</label>
        <div class="flex items-center gap-3">
          <div class="avatar">
            <div class="w-12 rounded-full">
              <img :src="avatarUrl" />
            </div>
          </div>
          <input
            type="file"
            class="file-input"
            accept="image/*"
            :disabled="isLoading"
            @change="uploadFile"
          />
          <span
            v-if="isLoading"
            class="loading loading-spinner loading-sm"
          ></span>
        </div>
      </fieldset>

      <button
        type="submit"
        class="btn btn-primary btn-xl text-lg btn-block text-neutral-content"
        :disabled="isLoading"
      >
        <span
          v-if="isLoading"
          class="loading loading-spinner"
        ></span>
        Save
      </button>
    </form>
  </main>
</template>
