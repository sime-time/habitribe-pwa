import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "~/stores/auth-store";
import { storeToRefs } from "pinia";
import Habits from "~/views/(habit)/Habits.vue";
import SignIn from "~/views/(auth)/SignIn.vue";
import SignUp from "~/views/(auth)/SignUp.vue";
import VerifyEmail from "~/views/(auth)/VerifyEmail.vue";
import Tribe from "~/views/(tribe)/Tribe.vue";
import CreateHabit from "~/views/(habit)/CreateHabit.vue";
import History from "~/views/History.vue";
import Profile from "~/views/Profile.vue";
import Settings from "~/views/Settings.vue";
import CreateTribe from "~/views/(tribe)/CreateTribe.vue";
import JoinTribe from "~/views/(tribe)/JoinTribe.vue";
import EditHabit from "~/views/(habit)/EditHabit.vue";
import TribeMember from "~/views/(tribe)/TribeMember.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "habits",
      component: Habits,
    },
    {
      path: "/sign-in",
      name: "sign-in",
      component: SignIn,
    },
    {
      path: "/sign-up",
      name: "sign-up",
      component: SignUp,
    },
    {
      path: "/verify-email",
      name: "verify-email",
      component: VerifyEmail,
    },
    {
      path: "/tribe",
      name: "tribe",
      component: Tribe,
    },
    {
      path: "/history",
      name: "history",
      component: History,
    },
    {
      path: "/habit/edit",
      name: "edit-habit",
      component: EditHabit,
    },
    {
      path: "/habit/create",
      name: "create-habit",
      component: CreateHabit,
    },
    {
      path: "/profile",
      name: "profile",
      component: Profile,
    },
    {
      path: "/settings",
      name: "settings",
      component: Settings,
    },
    {
      path: "/tribe/create",
      name: "create-tribe",
      component: CreateTribe,
    },
    {
      path: "/tribe/join",
      name: "join-tribe",
      component: JoinTribe,
    },
    {
      path: "/tribe/member",
      name: "tribe-member",
      component: TribeMember,
    },
  ],
});

// navigation guard for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const { authenticated, user } = storeToRefs(authStore);

  // routes that do NOT require authentication
  const publicRoutes = ["/sign-in", "/sign-up", "/verify-email"];

  // if the user is not authenticated
  if (!authenticated.value && !publicRoutes.includes(to.path)) {
    return next("/sign-up");
  }

  // if the route is an auth page AND user is authenticated
  if (
    (to.path === "/sign-in" || to.path === "/sign-up") &&
    authenticated.value
  ) {
    return next("/");
  }

  // if the route is a tribe join/creation page,
  // make sure the user has a profile pic and display name
  // if (
  //   (to.path === "/tribe/create" || to.path === "/tribe/join") &&
  //   (!user.value.image || !user.value.displayName)
  // ) {
  //   return next("/profile");
  // }

  // otherwise, continue to route as normal
  return next();
});

export default router;
