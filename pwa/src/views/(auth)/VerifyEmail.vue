<script setup lang="ts">
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "~/stores/auth-store";
import { useRoute } from "vue-router";
import { haptic } from "~/plugins/haptic";

const authStore = useAuthStore();
const { loading } = storeToRefs(authStore);
const { verifyEmailCode, sendCodeToEmail } = authStore;

const route = useRoute();
const email = route.query.address as string;
const code = ref();

async function handleVerification() {
  haptic.confirm();
  verifyEmailCode(email, code.value);
}

async function resendCodeToEmail() {
  haptic();
  sendCodeToEmail(email, true);
}

onMounted(async () => await sendCodeToEmail(email));
</script>

<template>
  <main class="flex flex-col items-center justify-center px-5">

    <h1 class="text-neutral-content text-4xl font-semibold mt-32">Verify Your Email</h1>
    <p class="text-center mb-6 mt-2">
      We've sent a verification code to
      <span class="text-secondary">{{ email }}</span>
    </p>

    <!-- FORM CONTAINER -->
    <form class="fieldset space-y-3" @submit.prevent="handleVerification">

      <!-- VERIFICATION CODE INPUT -->
      <input v-model="code" type="number" class="input input-lg text-center" placeholder="XXXXXX" inputmode="numeric" />

      <!-- VERIFY BUTTON -->
      <button type="submit" class="btn btn-lg btn-primary" :disabled="loading">
        <span v-if="loading">Verifying...</span>
        <span v-else>Verify Email</span>
      </button>

      <!-- RESEND EMAIL -->
      <button type="button" class="text-center text-sm" @click="resendCodeToEmail">
        <p>Didn't get an email? <span class="link link-primary">Resend code to email</span></p>
      </button>
    </form>
  </main>
</template>
