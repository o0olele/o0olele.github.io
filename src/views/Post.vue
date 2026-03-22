<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getPostBySlug } from '@/utils/posts'
import Counter from '@/components/Counter.vue'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const post = computed(() => getPostBySlug(slug.value))

const components = {
  Counter,
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <RouterLink to="/" class="text-blue-600 hover:underline mb-4 inline-block">
      ← 返回首页
    </RouterLink>

    <article v-if="post" class="prose max-w-none">
      <h1 class="text-4xl font-bold mb-4">{{ post.title }}</h1>
      <p class="text-gray-500 mb-8">{{ post.date }}</p>
      <component :is="{ template: post.html, components }" />
    </article>

    <div v-else class="text-center py-12">
      <h1 class="text-2xl font-bold">文章未找到</h1>
      <RouterLink to="/" class="text-blue-600 hover:underline mt-4 inline-block">
        返回首页
      </RouterLink>
    </div>
  </div>
</template>
