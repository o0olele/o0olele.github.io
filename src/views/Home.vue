<script setup lang="ts">
import { getAllPosts } from '@/utils/posts'
import { RouterLink } from 'vue-router'

const posts = getAllPosts()
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-8">我的博客</h1>
    
    <div class="space-y-6">
      <article
        v-for="post in posts"
        :key="post.slug"
        class="p-6 border rounded-lg hover:shadow-lg transition-shadow"
      >
        <RouterLink :to="`/posts/${post.slug}`">
          <h2 class="text-2xl font-semibold hover:text-blue-600">
            {{ post.title }}
          </h2>
        </RouterLink>
        <p class="text-gray-500 mt-2">{{ post.date }}</p>
      </article>
    </div>
  </div>
</template>
