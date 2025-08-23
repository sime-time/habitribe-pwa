<script setup lang="ts">
import IconSettings from "~icons/solar/settings-outline";
import IconLogout from "~icons/tabler/logout-2";
import IconUser from "~icons/solar/user-circle-outline";
import IconWhatsApp from "~icons/tabler/brand-whatsapp";
import { useAuthStore } from "~/stores/auth-store";
import { haptic } from "~/plugins/haptic";

const authStore = useAuthStore();

async function handleSignOut() {
  haptic.confirm();
  await authStore.signOut();
}
</script>

<template>
  <div class="dropdown">
    <div
      tabindex="0"
      role="button"
      class="btn btn-ghost btn-circle"
      @click="() => haptic()"
    >
      <icon-settings style="font-size: 1.5em" />
    </div>
    <ul
      tabindex="0"
      class="menu menu-lg dropdown-content bg-base-200 rounded-box z-1 mt-3 w-52 p-3 shadow space-y-3"
    >

      <li>
        <router-link
          to="/profile"
          class="bg-base-100"
        >
          <icon-user />
          Profile
        </router-link>
      </li>
      <li>
        <a
          href="https://chat.whatsapp.com/ISGoSen2rF5HbIqFQuOPLb?mode=ems_copy_t"
          class="bg-base-100"
        >
          <icon-whats-app />
          Our WhatsApp
        </a>
      </li>
      <li>
        <button
          class="bg-primary flex text-neutral-content"
          @click="handleSignOut"
        >
          <icon-logout />
          Sign out
        </button>
      </li>
    </ul>
  </div>
</template>
