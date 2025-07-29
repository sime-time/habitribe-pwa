<script setup lang="ts">
import IconSettings from "~icons/tabler/settings";
import IconLogout from "~icons/tabler/logout-2";
import IconUser from "~icons/solar/user-circle-outline";
import IconAdjust from "~icons/tabler/adjustments-horizontal";
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
    <button
      tabindex="0"
      role="button"
      class="btn btn-ghost btn-circle"
      @click="() => haptic()"
    >
      <icon-settings style="font-size: 1.5em" />
    </button>
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
        <router-link
          to="/settings"
          class="bg-base-100"
        >
          <icon-adjust />
          Settings
        </router-link>
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
