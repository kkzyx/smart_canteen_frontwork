<script lang="ts" setup>
import { useSettingsStore, useAppStore } from "@/store";
import defaultSettings from "@/settings";
import variables from "@/styles/variables.module.scss";

const appStore = useAppStore();
const settingsStore = useSettingsStore();

defineProps({
  collapse: {
    type: Boolean,
    default: false,
  },
});

onMounted(() => {
  appStore.getShopStatus();
});

const logo = ref(new URL(`@/assets/logo/logo_5.svg`, import.meta.url).href);

defineOptions({
  name: "SidebarLogo",
});
</script>

<template>
  <div
    class="logo-container"
    :style="{
      height: variables['logo-height'],
    }"
  >
    <!-- 动画过渡依赖 animate.css -->
    <transition enter-active-class="animate__animated animate__fadeInLeft">
      <!-- 折叠侧边栏 -->
      <router-link v-if="collapse" class="wh-full flex-center" to="/">
        <div
          :title="appStore.isOpenShop ? '营业中' : '打烊中'"
          class="shop-status wh-full flex-center"
          :class="{ 'shop-is-open': appStore.isOpenShop }"
        >
          <img
            v-if="settingsStore.sidebarLogo"
            :src="logo"
            class="w-40px h-40px"
          />
        </div>
      </router-link>

      <!-- 展开侧边栏 -->
      <router-link v-else class="wh-full flex-center flex-col" to="/">
        <div
          :title="appStore.isOpenShop ? '营业中' : '打烊中'"
          class="shop-status flex-col flex-center"
          :class="{ 'shop-is-open': appStore.isOpenShop }"
        >
          <img
            v-if="settingsStore.sidebarLogo"
            :src="logo"
            :style="{
              width: variables['logo-image-wh'],
              height: variables['logo-image-wh'],
            }"
          />
          <span class="logo-title">{{
            defaultSettings.title
          }}</span>
        </div>
      </router-link>
    </transition>
  </div>
</template>
<style lang="scss" scoped>
.logo-container {
  width: 100%;
  background: linear-gradient(180deg, #111827 0%, #1f2937 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  transition: height 0.3s ease-in-out;

  .logo-title {
    flex-shrink: 0;
    margin-top: 6px;
    font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
    font-size: 17px;
    font-weight: 600;
    letter-spacing: 1px;
    color: rgba(255, 255, 255, 0.78); // 白灰色
    transition: color 0.2s ease;
  }

  img {
    object-fit: contain;
    filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.18));
  }
}

.shop-status {
  position: relative;

  &::after {
    content: "";
    position: absolute;
    right: 17px;
    bottom: 30px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #ef4444;
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.45);
  }
}

.shop-is-open {
  &::after {
    background-color: #22c55e;
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.45);
  }
}

.layout-top,
.layout-mix {
  .logo-container {
    width: $sidebar-width;
  }

  &.hideSidebar {
    .logo-container {
      width: $sidebar-width-collapsed;
    }
  }
}
</style>