<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { ChartData, ChartOptions } from "chart.js";
import DoughnutChart from "~/components/charts/DoughnutChart.vue";

const props = defineProps<{
  percent: number;
}>();


const colorSuccess = ref("");
const colorPrimary = ref("");
const colorBase = ref("");

onMounted(() => {
  const styles = getComputedStyle(document.documentElement);
  colorSuccess.value = styles.getPropertyValue("--color-success").trim();
  colorPrimary.value = styles.getPropertyValue("--color-primary").trim();
  colorBase.value = styles.getPropertyValue("--color-base-200").trim();
});

const backgroundColor = computed(() => {
  if (!colorSuccess.value) {
    return [];
  }
  return props.percent >= 100
    ? [colorSuccess.value]
    : [colorPrimary.value, colorBase.value];
});

const chartData = computed(() => {
  // returns [completedPercentage, remainingPercentage]
  let percentComplete = props.percent
  let percentRemaining = 100 - percentComplete;
  if (percentRemaining < 0) {
    percentRemaining = 0;
  }
  return [percentComplete, percentRemaining];
});

const borderRadius = computed(() => {
  // if 100% or 0% complete, remove border radius from radial circle
  return (props.percent >= 100 || props.percent === 0) ? 0 : 6;
});

// This is the data that will be displayed in the chart.
// It's reactive, so if you change this data, the chart will update.
const data = computed<ChartData<"doughnut">>(() => ({
  labels: ["Completed", "Remaining"],
  datasets: [
    {
      label: "Progress",
      backgroundColor: backgroundColor.value,
      data: chartData.value,
      borderWidth: 0,
      borderRadius: borderRadius.value,
    },
  ],
}));

// Customize the chart's appearance and behavior.
const options = ref<ChartOptions<"doughnut">>({
  responsive: true,
  maintainAspectRatio: true, // Allow the chart to fill its container
  cutout: "75%", // The size of the hole in the middle, creating the "donut" effect
  circumference: 360,
  plugins: {
    legend: {
      display: false, // Hide the default legend
    },
    tooltip: {
      enabled: false,
    },
  },
});
</script>

<template>
  <div class="relative w-64 h-64">
    <DoughnutChart
      :chart-data="data"
      :chart-options="options"
    />
    <div class="absolute inset-0 flex items-center justify-center gap-1 pointer-events-none">
      <span class="text-5xl font-bold">{{ percent }}</span>
      <span class="text-4xl">%</span>
    </div>
  </div>
</template>
