<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { divide } from "~/plugins/divide";
import { haptic } from "~/plugins/haptic";
import { useToast } from "vue-toastification";
import IconX from "~icons/tabler/x";
import IconMinus from "~icons/tabler/minus";
import IconPlus from "~icons/tabler/plus";
import IconCamera from "~icons/tabler/camera";

const props = defineProps<{
  id: number;
  name: string;
  goal: number;
  progress: number;
  unit: string;
  date: string;
  image?: string;
  readonly?: boolean;
}>();

// --- Track Progress ---
const incrementAmount = computed(() => divide(100, props.goal));

const progressPercent = ref(props.progress * incrementAmount.value);
const progressValue = computed(() => divide(progressPercent.value, incrementAmount.value));

const emit = defineEmits(["updateProgress"])
function increment() {
  if (!props.readonly) {
    haptic();
    progressPercent.value += incrementAmount.value;
    emit("updateProgress", progressValue.value, props.id);
  }
}
function decrement() {
  haptic();
  progressPercent.value -= incrementAmount.value;

  // progress cannot be negative
  if (progressPercent.value < 0) {
    progressPercent.value = 0;
  }

  emit("updateProgress", progressValue.value, props.id);
}
function reset() {
  haptic();
  progressPercent.value = 0;
  emit("updateProgress", progressValue.value, props.id);
}

// change radial color to success color when progress >= goal
const goalReached = ref(props.progress >= props.goal);
watch(progressValue, (newProgress: number) => {
  if (newProgress >= props.goal) {
    goalReached.value = true;
  } else {
    goalReached.value = false;
  }
});

// -- Modal: Edit Habit Entry --
const dialog = ref<HTMLDialogElement | null>(null);

// -- Upload Proof --
const proofImage = ref<string | null>(null);
const proofInput = ref<HTMLInputElement | null>(null);
const proofPreviewUrl = ref<string | null>(null);
const toast = useToast();
const isLoading = ref(false);

const proofUrl = computed(() => {
  // priority to show the client's currently uploaded image
  if (proofPreviewUrl.value) {
    return proofPreviewUrl.value;
  }

  // check if env variable exists
  const r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL;
  if (!r2PublicUrl) {
    console.error("VITE_R2_PUBLIC_URL is not set in your .env file.");
    return null;
  }

  // use the recently uploaded image if available
  if (proofImage.value) {
    return `${r2PublicUrl}/${proofImage.value}`;
  }

  // use the component property image
  if (props.image) {
    return `${r2PublicUrl}/${props.image}`;
  }

  return null;
});

// trigger the hidden input element
const triggerProofInput = () => {
  proofInput.value?.click();
}

const handleProofSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  console.log("File selected:", file.name);

  // Create a temporary local URL to provide an instant preview of the new avatar.
  proofPreviewUrl.value = URL.createObjectURL(file);
  isLoading.value = true;

  try {
    // Step 1: Get the pre-signed URL from the backend
    const presignResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/proof-url`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentType: file.type,
        habitId: props.id,
        date: props.date
      }),
    });

    // key is the url of the image relative to the cloudflare r2 url
    const { uploadUrl, key } = await presignResponse.json();
    proofImage.value = key;

    // Step 2: Upload the file directly to R2 using presign url
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
    if (!uploadResponse.ok) {
      throw new Error("error uploading habit entry proof image to cloudflare")
    }

    // Step 3: Update the habit entry image in the database
    const updateResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/habit/entries/update/image/${props.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: props.date,
        image: key,
      }),
    });
    if (!updateResponse.ok) {
      throw new Error("error updating habit entry proof image")
    }

    // Optimistic UI Update
    proofPreviewUrl.value = null; // Clear the temporary preview
    toast.success(`Added proof to ${props.name}`)

  } catch (error) {
    console.error("Failed to upload proof:", error);
    toast.error("Failed to upload proof")
    proofPreviewUrl.value = null; // Clear the preview on error
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="card bg-base-200 flex flex-row justify-between items-center">
    <section class="flex items-center ml-4">
      <!-- Upload Proof -->
      <button
        @click="triggerProofInput"
        class="btn btn-square btn-dash btn-xl btn-secondary"
      >
        <div
          v-if="proofUrl"
          class="avatar"
        >
          <div class="rounded">
            <img
              :src="proofUrl"
              class="w-fit h-fit"
            />
          </div>
        </div>
        <icon-camera v-else />
      </button>
      <input
        type="file"
        ref="proofInput"
        @change="handleProofSelected"
        class="hidden"
        accept="image/*"
      />

      <div
        class="card-body p-4 cursor-pointer"
        @click="dialog?.showModal()"
      >
        <h2 class="card-title capitalize">{{ name }}</h2>
        <p class="opacity-70">{{ `Goal: ${goal} ${unit}` }}</p>
      </div>

    </section>
    <div class="card-actions p-2 ">

      <button
        class="radial-progress"
        :class="goalReached ? 'text-success' : 'text-primary'"
        :style="`--value:${progressPercent}; --size:3.75rem; --thickness:0.5rem`"
        :aria-valuenow="progressPercent"
        role="progressbar"
        @click="increment"
      >
        <span class="text-md font-bold text-neutral-content">{{ progressValue }}</span>
      </button>
    </div>
  </div>

  <!-- Slide Up Modal -->
  <dialog
    v-if="!readonly"
    ref="dialog"
    class="modal modal-bottom sm:modal-middle"
  >
    <div class="modal-box space-y-6 pb-10">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-lg">
          <icon-x />
        </button>
      </form>

      <div class="text-center">
        <h3 class="text-2xl font-bold capitalize">{{ name }}</h3>
        <p class="text-sm opacity-70">{{ `Goal: ${goal} ${unit}` }}</p>
      </div>

      <div class="flex justify-center items-center gap-4">
        <button
          class="btn btn-circle text-lg"
          @click="decrement"
        >
          <icon-minus />
        </button>
        <div
          class="radial-progress"
          :class="goalReached ? 'text-success' : 'text-primary'"
          :style="`--value:${progressPercent}; --size:9rem; --thickness:1.25rem`"
          :aria-valuenow="progressPercent"
          role="progressbar"
        >
          <span class="text-3xl font-bold text-neutral-content">{{ progressValue }}</span>
        </div>
        <button
          class="btn btn-circle text-lg"
          @click="increment"
        >
          <icon-plus />
        </button>
      </div>



      <button
        class="btn btn-primary btn-block btn-lg"
        @click="reset"
      >
        Reset
      </button>
      <button
        class="btn btn-secondary btn-block btn-lg"
        @click="triggerProofInput"
      >
        Send Proof
      </button>
      <router-link
        :to="`/habit/edit?id=${id}`"
        class="btn btn-block btn-lg"
      >
        Edit Habit
      </router-link>
    </div>
  </dialog>

</template>
