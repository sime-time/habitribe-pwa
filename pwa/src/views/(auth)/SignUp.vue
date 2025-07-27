<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "~/stores/auth-store";
import { storeToRefs } from "pinia";
import { RouterLink } from "vue-router";
import { haptic } from "~/plugins/haptic";
import IconEye from "~icons/tabler/eye";
import IconEyeOff from "~icons/tabler/eye-off";

const authStore = useAuthStore();
const { loading } = storeToRefs(authStore);
const { signUp } = authStore;

const name = ref("");
const email = ref("");
const password = ref("");
const showPassword = ref(false);

function toggleShowPassword() {
  showPassword.value = !showPassword.value;
}

async function handleSignUp() {
  haptic.confirm();
  signUp(name.value, email.value, password.value);
}
</script>

<template>
  <main class="flex flex-col justify-center">
    <h1 class="text-neutral-content text-4xl font-semibold text-center mb-6 mt-32">Create Account</h1>

    <!-- FORM CONTAINER -->
    <form class="fieldset space-y-3 mx-[1rem]" @submit.prevent="handleSignUp">
      <input v-model="name" type="text" class="input input-lg w-full" placeholder="Your name" />

      <input v-model="email" type="text" class="input input-lg w-full" placeholder="Enter email" />

      <label class="input input-lg w-full">
        <input v-model="password" :type="showPassword ? 'text' : 'password'" class="grow"
          placeholder="Enter password" />
        <button type="button" class="cursor-pointer" @click="toggleShowPassword">
          <icon-eye v-if="showPassword" />
          <icon-eye-off v-else />
        </button>
      </label>

      <button type="submit" class="btn btn-lg btn-primary mt-3">
        <span v-if="loading">Signing Up...</span>
        <span v-else>Sign Up</span>
      </button>

      <!-- SIGN IN LINK -->
      <RouterLink to="/sign-in" class="text-center text-sm">
        <p>Already have an account? <span class="link link-primary">Sign in</span></p>
      </RouterLink>
    </form>


  </main>
</template>
