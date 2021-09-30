<template>
  <div>
    <span v-for="({path},i) of routes">
      <router-link :to="path">{{ path.substr(1) }}</router-link>
      <span v-if="i!==routes.length-1"> | </span>
    </span>
  </div>

  <router-view></router-view>
</template>

<script setup>
import { routes } from './router'

</script>

<style lang="scss" scoped>

</style>
