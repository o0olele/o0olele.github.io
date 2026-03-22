<script setup lang="ts">
import { computed } from 'vue'
import Counter from '@/components/Counter.vue'

const props = defineProps<{
  html: string
}>()

const components: Record<string, any> = {
  Counter,
}

const parsedContent = computed(() => {
  const parts: Array<{ type: 'html' | 'component'; content: string; component?: string }> = []
  
  const regex = /<([A-Z][a-zA-Z0-9]*)\s*\/>/g
  let lastIndex = 0
  let match
  
  while ((match = regex.exec(props.html)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'html', content: props.html.slice(lastIndex, match.index) })
    }
    
    const componentName = match[1]
    if (components[componentName]) {
      parts.push({ type: 'component', content: match[0], component: componentName })
    } else {
      parts.push({ type: 'html', content: match[0] })
    }
    
    lastIndex = match.index + match[0].length
  }
  
  if (lastIndex < props.html.length) {
    parts.push({ type: 'html', content: props.html.slice(lastIndex) })
  }
  
  return parts
})
</script>

<template>
  <div class="markdown-content">
    <template v-for="(part, index) in parsedContent" :key="index">
      <div v-if="part.type === 'html'" v-html="part.content" />
      <component v-else-if="part.type === 'component' && part.component" :is="components[part.component]" />
    </template>
  </div>
</template>

<style>
.markdown-content h1 {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.markdown-content h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.markdown-content p {
  margin-bottom: 1rem;
}

.markdown-content ul {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.markdown-content li {
  margin-bottom: 0.25rem;
}

.markdown-content pre {
  background-color: #1e1e1e;
  color: #d4d4d4;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.markdown-content code {
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
}

.markdown-content strong {
  font-weight: 600;
}
</style>
