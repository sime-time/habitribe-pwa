<script setup lang="ts">
import { useAuthStore } from "~/stores/auth-store";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import IconEye from "~icons/tabler/eye";
import IconEyeOff from "~icons/tabler/eye-off";
import { haptic } from "~/plugins/haptic";

const authStore = useAuthStore();
const { loading } = storeToRefs(authStore);
const { signIn } = authStore;

const email = ref("");
const password = ref("");
const showPassword = ref(false);

function toggleShowPassword() {
  showPassword.value = !showPassword.value;
}

async function handleSignIn() {
  haptic.confirm();
  await signIn(email.value, password.value);
}
</script>

<template>
  <main class="flex flex-col justify-center">
    <h1 class="text-neutral-content text-4xl font-semibold text-center mb-6 mt-32">Welcome Back</h1>

    <!-- FORM CONTAINER -->
    <form class="fieldset space-y-3 mx-[1rem]" @submit.prevent="handleSignIn">

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
        <span v-if="loading">Signing In...</span>
        <span v-else>Sign In</span>
      </button>

      <!-- SIGN UP LINK -->
      <RouterLink to="/sign-up" class="text-center text-sm">
        <p>Don't have an account? <span class="link link-primary">Sign up</span></p>
      </RouterLink>
    </form>


  </main>
</template>
