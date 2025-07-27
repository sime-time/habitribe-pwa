import "./assets/styles/main.css";
import "vue-toastification/dist/index.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { useAuthStore } from "~/stores/auth-store";
import { VueQueryPlugin } from "@tanstack/vue-query";

import App from "./App.vue";
import router from "./router";
import Toast from "vue-toastification";

async function startApp() {
  const app = createApp(App);
  const pinia = createPinia();
  app.use(pinia);

  // Get the auth store instance
  const authStore = useAuthStore();

  // Wait for the initial auth check to complete
  await authStore.checkAuthStatus();

  // Now that we know the user's auth status, we can install the router
  app.use(router);

  app.use(Toast, {
    position: "top-center",
    timeout: 3000,
  });

  // Initialize Vue Query
  app.use(VueQueryPlugin);

  // Finally, mount the app
  app.mount("#app");
}

startApp();
