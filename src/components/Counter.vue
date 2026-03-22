<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'

const count = ref(0)
</script>

<template>
  <div class="flex items-center gap-4 p-4 border rounded-lg">
    <Button variant="outline" @click="count--">-</Button>
    <span class="text-2xl font-bold min-w-[3ch] text-center">{{ count }}</span>
    <Button @click="count++">+</Button>
  </div>
</template>
