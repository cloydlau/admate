<template>
  Vue {{ isVue2 ? '2' : '3' }} UI Framework demo:
  <span v-for="({path},i) of routes">
    <router-link :to="path">{{ path.substr(1) }}</router-link>
    <span v-if="i!==routes.length-1"> | </span>
  </span>

  <!--  <router-view></router-view>-->

  <router-view v-slot="{ Component }">
    <transition>
      <keep-alive>
        <component :is="Component"/>
      </keep-alive>
    </transition>
  </router-view>
</template>

<script setup>
import { isVue2 } from 'vue-demi'
import { routes } from './router'

</script>

<style lang="scss" scoped>

</style>
