<script setup lang="ts">
import type { ChartData, ChartOptions } from "chart.js";
import { Doughnut } from "vue-chartjs";
import "~/plugins/chart";

defineProps<{
  chartData: ChartData<"doughnut">;
  chartOptions?: ChartOptions<"doughnut">;
}>();
</script>

<template>
  <Doughnut :data="chartData" :options="chartOptions" />
</template>
