<template>
  <tr>
    <td>{{ appointment.time }}</td>
    <td>{{ appointment.client }}</td>
    <td>{{ appointment.service }}</td>
    <td>
      <span class="badge" :class="appointment.status">{{ appointment.statusLabel }}</span>
    </td>
  </tr>
</template>

<script setup>
defineProps({
  appointment: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
td {
  padding: 14px;
  border-bottom: 1px solid var(--border);
  color: var(--text);
  font-size: 14px;
}

tr:hover {
  background-color: var(--surface-2);
}

@media (max-width: 480px) {
  td {
    padding: 8px;
  }
}
</style>
