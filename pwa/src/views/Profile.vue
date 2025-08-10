<script setup lang="ts">
import NavBar from '~/components/NavBar.vue';

async function uploadFile(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // get the pre-signed URL from your backend
  const response = await fetch("/api/upload/avatar-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contentType: file.type,
    }),
  });
  const { uploadUrl, key } = await response.json();

  // upload the file directly to R2
  await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  // update the user's profile with the new avatar URL key
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
              <img src="https://img.daisyui.com/images/profile/demo/batperson@192.webp" />
            </div>
          </div>
          <input
            type="file"
            class="file-input"
            accept="image"
            @change="uploadFile"
          />

        </div>
      </fieldset>

      <button
        type="submit"
        class="btn btn-primary btn-xl text-lg btn-block text-neutral-content"
      >
        Save
      </button>


    </form>
  </main>
</template>
