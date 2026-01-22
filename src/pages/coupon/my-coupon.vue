<template>
  <view class="coupon-page">
    <!-- Tab切换 -->
    <view class="tabs">
      <view
        v-for="(tab, index) in tabs"
        :key="index"
        :class="['tab-item', { active: currentTab === index }]"
        @click="changeTab(index)"
      >
        {{ tab.label }}
      </view>
    </view>

    <!-- 优惠券列表 -->
    <scroll-view scroll-y class="coupon-list" v-if="couponList.length > 0">
      <view
        v-for="item in couponList"
        :key="item.id"
        :class="['coupon-card', `status-${item.status}`, { selectable: isSelectMode && item.status === 0 }]"
        @click="handleSelectCoupon(item)"
      >
        <!-- 优惠券左侧 -->
        <view class="coupon-left">
          <view class="amount">
            <text class="symbol">¥</text>
            <text class="value" v-if="item.type === 1 || item.type === 3">
              {{ item.discountAmount }}
            </text>
            <text class="value" v-else>
              {{ (item.discountRate * 10).toFixed(1) }}折
            </text>
          </view>
          <view class="condition">
            {{ item.minAmount > 0 ? `满${item.minAmount}元可用` : '无门槛' }}
          </view>
        </view>

        <!-- 优惠券右侧 -->
        <view class="coupon-right">
          <view class="name">{{ item.name }}</view>
          <view class="desc">{{ item.description }}</view>
          <view class="time">
            有效期至: {{ formatDate(item.endTime) }}
          </view>
          <view class="status-tag" v-if="item.status === 1">已使用</view>
          <view class="status-tag" v-if="item.status === 2">已过期</view>
          <view class="use-btn" v-if="isSelectMode && item.status === 0">使用</view>
        </view>
      </view>
    </scroll-view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <image src="/static/empty.png" class="empty-image" mode="aspectFit" />
      <text class="empty-text">暂无优惠券</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import CouponAPI, { type UserCouponVO } from '@/api/coupon';

const tabs = [
  { label: '未使用', value: 0 },
  { label: '已使用', value: 1 },
  { label: '已过期', value: 2 },
];

const currentTab = ref(0);
const couponList = ref<UserCouponVO[]>([]);
const isSelectMode = ref(false);

// 切换Tab
const changeTab = (index: number) => {
  currentTab.value = index;
  loadCoupons();
};

// 加载优惠券
const loadCoupons = async () => {
  try {
    uni.showLoading({ title: '加载中...' });
    const status = tabs[currentTab.value].value;
    const res = await CouponAPI.my(status);
    couponList.value = res.data || [];
  } catch (error) {
    console.error('加载优惠券失败:', error);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    uni.hideLoading();
  }
};

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return dateStr.substring(0, 10);
};

// 选择优惠券
const handleSelectCoupon = (coupon: UserCouponVO) => {
  if (!isSelectMode.value || coupon.status !== 0) return;
  
  console.log('=== 选择优惠券 ===');
  console.log('优惠券数据:', coupon);
  
  // 使用全局事件总线发送优惠券数据
  uni.$emit('coupon-selected', coupon);
  console.log('已通过uni.$emit发送coupon-selected事件');
  
  // 返回上一页
  uni.navigateBack();
};

onLoad((options: any) => {
  isSelectMode.value = options.selectMode === 'true';
});

onMounted(() => {
  loadCoupons();
});
</script>

<style scoped lang="scss">
.coupon-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.tabs {
  display: flex;
  background-color: #fff;
  border-bottom: 1rpx solid #e5e5e5;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 30rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;

  &.active {
    color: #ff6b6b;
    font-weight: bold;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60rpx;
      height: 4rpx;
      background-color: #ff6b6b;
      border-radius: 2rpx;
    }
  }
}

.coupon-list {
  padding: 20rpx;
  height: calc(100vh - 120rpx);
}

.coupon-card {
  display: flex;
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);

  &.status-1,
  &.status-2 {
    opacity: 0.6;
  }
}

.coupon-left {
  width: 200rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30rpx 20rpx;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    right: -10rpx;
    top: 50%;
    transform: translateY(-50%);
    width: 20rpx;
    height: 20rpx;
    background-color: #f5f5f5;
    border-radius: 50%;
  }

  .status-1 &,
  .status-2 & {
    background: linear-gradient(135deg, #ccc 0%, #ddd 100%);
  }
}

.amount {
  display: flex;
  align-items: baseline;
  margin-bottom: 10rpx;

  .symbol {
    font-size: 32rpx;
    font-weight: bold;
  }

  .value {
    font-size: 56rpx;
    font-weight: bold;
    line-height: 1;
  }
}

.condition {
  font-size: 22rpx;
  opacity: 0.9;
}

.coupon-right {
  flex: 1;
  padding: 30rpx;
  position: relative;
}

.name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.desc {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.time {
  font-size: 22rpx;
  color: #999;
}

.status-tag {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  padding: 8rpx 16rpx;
  background-color: #f5f5f5;
  color: #999;
  font-size: 22rpx;
  border-radius: 8rpx;
}

.use-btn {
  position: absolute;
  bottom: 20rpx;
  right: 20rpx;
  padding: 12rpx 32rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
  color: #fff;
  font-size: 26rpx;
  font-weight: bold;
  border-radius: 40rpx;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);
}

.coupon-card.selectable {
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-image {
  width: 300rpx;
  height: 300rpx;
  margin-bottom: 40rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>
