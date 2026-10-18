<script lang="ts" setup>
import {
  useAppStore,
  useSettingsStore,
  useUserStore,
  useTagsViewStore,
} from "@/store";
import { Clock } from "@element-plus/icons-vue";
import defaultSettings from "@/settings";
import { DeviceEnum } from "@/enums/DeviceEnum";
import { MessageTypeEnum } from "@/enums/MessageTypeEnum";
import { StatusEnum } from "@/enums/StatusEnum";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const tagsViewStore = useTagsViewStore();
const appStore = useAppStore();
const settingStore = useSettingsStore();

const isMobile = computed(() => appStore.device === DeviceEnum.MOBILE);

const { isFullscreen, toggle } = useFullscreen();

const activeTab = ref(MessageTypeEnum.MESSAGE);

const messages = ref([
  {
    id: 1,
    title: "系统升级通知：服务器将于今晚12点进行升级维护，请提前保存工作内容。",
    type: MessageTypeEnum.MESSAGE,
  },
  {
    id: 2,
    title: "新功能发布：我们的应用程序现在支持多语言功能。",
    type: MessageTypeEnum.MESSAGE,
  },
  {
    id: 3,
    title: "重要提醒：请定期更改您的密码以保证账户安全。",
    type: MessageTypeEnum.MESSAGE,
  },
  {
    id: 4,
    title: "通知：您有一条未读的系统消息，请及时查看。",
    type: MessageTypeEnum.NOTICE,
  },
  {
    id: 5,
    title: "新订单通知：您有一笔新的订单需要处理。",
    type: MessageTypeEnum.NOTICE,
  },
  {
    id: 6,
    title: "审核提醒：您的审核请求已被批准。",
    type: MessageTypeEnum.NOTICE,
  },
  { id: 7, title: "待办事项：完成用户权限设置。", type: MessageTypeEnum.TODO },
  { id: 8, title: "待办事项：更新产品列表。", type: MessageTypeEnum.TODO },
  { id: 9, title: "待办事项：备份数据库。", type: MessageTypeEnum.TODO },
]);

const shopStatusOptions = computed(() => {
  return [
    { label: "营业中", value: StatusEnum.ENABLE },
    { label: "打样中", value: StatusEnum.DISABLE },
  ];
});

const getFilteredMessages = (type: MessageTypeEnum) => {
  return messages.value.filter((message) => message.type === type);
};

/* 注销 */
function logout() {
  ElMessageBox.confirm("确定注销并退出系统吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
    lockScroll: false,
  }).then(() => {
    userStore
      .logout()
      .then(() => {
        tagsViewStore.delAllViews();
      })
      .then(() => {
        ElMessage.success("注销成功，即将返回登录页面");
        setTimeout(() => {
          router.push(`/login?redirect=${route.fullPath}`);
        }, 500);
      });
  });
}

defineOptions({
  name: "NavbarAction",
});
</script>

<template>
  <div class="flex">
    <template v-if="!isMobile">
      <el-tooltip
        class="nav-action-item"
        content="设置店铺状态"
        effect="dark"
        placement="top"
      >
        <el-dropdown
          class="shop-status nav-action-item flex-center!"
          trigger="click"
          @command="appStore.setShopStatus"
        >
          <el-icon size="17px"><Clock /></el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="item of shopStatusOptions"
                :key="item.value"
                :disabled="appStore.shopStatus === item.value"
                :command="item.value"
              >
                {{ item.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-tooltip>

      <!--全屏 -->
      <!-- <div class="nav-action-item" @click="toggle">
        <svg-icon
          :icon-class="isFullscreen ? 'fullscreen-exit' : 'fullscreen'"
        />
      </div> -->
    </template>

    <!-- 用户头像 -->
    <el-dropdown class="nav-action-item" trigger="click">
      <div class="flex-center h100% p10px">
        <img
          :title="defaultSettings.title"
          src="@/assets/avatar.png"
          class="rounded-full w24px w24px"
        />
        <!-- <div class="user-name" :title="defaultSettings.title">
          {{ defaultSettings.title }}
        </div> -->
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item divided @click="logout">
            {{ $t("navbar.logout") }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 设置 -->
    <template v-if="defaultSettings.showSettings">
      <div
        class="nav-action-item"
        @click="
          settingStore.changeSetting({ key: 'settingsVisible', value: true })
        "
      >
        <svg-icon icon-class="setting" />
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.nav-action-item {
  display: inline-block;
  min-width: 40px;
  height: $navbar-height;
  line-height: $navbar-height;
  color: var(--el-text-color);
  text-align: center;
  cursor: pointer;

  &:hover {
    background: rgb(0 0 0 / 10%);
  }

  .user-name {
    min-width: 30px;
    max-width: 50px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.shop-status {
  i {
    width: 100%;
    height: 100%;
  }
}

:deep(.message .el-badge__content.is-fixed.is-dot) {
  top: 5px;
  right: 10px;
}

:deep(.el-divider--horizontal) {
  margin: 10px 0;
}

.dark .nav-action-item:hover {
  background: rgb(255 255 255 / 20%);
}

.layout-top .nav-action-item,
.layout-mix .nav-action-item {
  color: #fff;
}
</style>
