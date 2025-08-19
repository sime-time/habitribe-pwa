<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import NavBar from "~/components/NavBar.vue";
import { useAuthStore } from "~/stores/auth-store";
import { useToast } from "vue-toastification";
import router from "~/router";

const authStore = useAuthStore();
const isLoading = ref(false);
const toast = useToast();

// --- Local State Management ---
// This holds a local copy of the user's data for editing.
// It's a best practice to avoid mutating the global store directly from form inputs.
const formState = ref({
  name: "",
  username: "",
  image: "",
});

// This will hold a temporary, local URL for the new avatar preview.
const avatarPreviewUrl = ref<string | null>(null);

// --- Lifecycle Hooks ---
// When the component mounts, we populate our local form state from the auth store.
onMounted(() => {
  if (authStore.user) {
    formState.value = {
      name: authStore.user.name,
      username: authStore.user.username || "",
      image: authStore.user.image || "",
    };
  }
});

// --- Computed Properties ---
// Determines the final URL for the avatar image tag.
// It prioritizes the local preview, then the R2 URL, and finally a default placeholder.
const avatarUrl = computed(() => {
  if (avatarPreviewUrl.value) {
    return avatarPreviewUrl.value; // Show the instant preview
  }

  const r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL;
  if (!r2PublicUrl) {
    console.error("VITE_R2_PUBLIC_URL is not set in your .env file.");
    return "https://img.daisyui.com/images/profile/demo/batperson@192.webp";
  }
  if (formState.value.image) {
    return `${r2PublicUrl}/${formState.value.image}`;
  }
  if (authStore.user.image) {
    return `${r2PublicUrl}/${authStore.user.image}`;
  }

  return "https://img.daisyui.com/images/profile/demo/batperson@192.webp";
});

// --- Methods ---
/**
 * Handles the file input change event.
 * This function now focuses only on the client-side logic: uploading the file
 * and updating the local state. It no longer saves anything to the database directly.
 */
async function handleAvatarUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file || !authStore.user) return;

  // Create a temporary local URL to provide an instant preview of the new avatar.
  avatarPreviewUrl.value = URL.createObjectURL(file);
  isLoading.value = true;

  try {
    // Step 1: Get the pre-signed URL from the backend.
    const presignResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/avatar-url`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentType: file.type,
        userId: authStore.user.id,
      }),
    });
    const { uploadUrl, key } = await presignResponse.json();

    // Step 2: Upload the file directly to R2.
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    // Step 3: Update our local form state with the new image key.
    // This will be saved when the user clicks the "Save" button.
    formState.value.image = key;
  } catch (error) {
    console.error("Failed to upload avatar:", error);
    avatarPreviewUrl.value = null; // Clear the preview on error
  } finally {
    isLoading.value = false;
  }
}

/**
 * Handles the form submission.
 * It intelligently sends only the fields that have actually changed.
 */
async function updateProfile() {
  if (!authStore.user) return;

  isLoading.value = true;
  const payload: Record<string, any> = {};

  // --- Efficient Payload Construction ---
  // Compare the current form state to the original user data from the store.
  // Only add the changed fields to the payload to send to the API.
  payload.id = authStore.user.id;

  if (formState.value.name !== authStore.user.name) {
    payload.name = formState.value.name;
  }
  if (formState.value.username !== authStore.user.username) {
    payload.username = formState.value.username;
  }
  if (formState.value.image !== authStore.user.image) {
    payload.image = formState.value.image;
  }

  // If nothing changed, don't make an unnecessary API call.
  if (Object.keys(payload).length === 0) {
    isLoading.value = false;
    return;
  }

  try {
    // Use the generic user update endpoint.
    await fetch(`${import.meta.env.VITE_API_URL}/api/user/update`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // --- Optimistic UI Update ---
    // After a successful save, update the global auth store.
    // This makes the UI feel instant.
    avatarPreviewUrl.value = null; // Clear the temporary preview

    toast.success("Profile updated");

    // go back to previous page
    router.back();

  } catch (error) {
    console.error("Failed to update profile:", error);
    toast.error("Failed to update profile");
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <nav-bar :back-button="true">Profile</nav-bar>
  <main class="container mx-auto px-4 mt-3 mb-6">
    <!-- The form now calls `updateProfile` on submit -->
    <form
      class="space-y-6"
      @submit.prevent="updateProfile"
    >
      <!-- Name -->
      <fieldset class="card bg-base-200 p-4 space-y-1">
        <label class="text-sm opacity-50">Name</label>
        <input
          v-model="formState.name"
          class="input input-sm input-ghost text-lg px-0"
          placeholder="Your full name"
        />
      </fieldset>

      <!-- Username -->
      <fieldset class="card bg-base-200 p-4 space-y-1">
        <label class="text-sm opacity-50">Username</label>
        <input
          v-model="formState.username"
          class="input input-sm input-ghost text-lg px-0"
          placeholder="Your public username"
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
            @change="handleAvatarUpload"
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
        Save Changes
      </button>
    </form>
  </main>
</template>
