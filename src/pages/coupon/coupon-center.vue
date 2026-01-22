<template>
  <view class="coupon-center">
    <view class="header">
      <text class="title">领取优惠券</text>
    </view>

    <!-- 优惠券列表 -->
    <scroll-view scroll-y class="coupon-list" v-if="couponList.length > 0">
      <view
        v-for="item in couponList"
        :key="item.id"
        class="coupon-card"
      >
        <!-- 优惠券左侧 -->
        <view class="coupon-left">
          <view class="amount">
            <text class="symbol">¥</text>
            <text class="value" v-if="item.type === 1 || item.type === 3">
              {{ item.discountAmount }}
            </text>
            <text class="value" v-else>
              {{ (item.discountRate * 10).toFixed(1) }}
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
          <view class="info">
            <text class="stock">剩余: {{ item.remainCount }}/{{ item.totalCount }}</text>
            <text class="limit">限领{{ item.perLimit }}张</text>
          </view>
          <view class="time">
            有效期至: {{ formatDate(item.endTime) }}
          </view>
          
          <!-- 领取按钮 -->
          <view class="action">
            <button 
              v-if="!item.received && item.remainCount > 0" 
              class="receive-btn" 
              @click="handleReceive(item)"
            >
              立即领取
            </button>
            <button v-else-if="item.received" class="received-btn" disabled>
              已领取
            </button>
            <button v-else class="soldout-btn" disabled>
              已领完
            </button>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <image src="/static/empty.png" class="empty-image" mode="aspectFit" />
      <text class="empty-text">暂无可领取的优惠券</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import CouponAPI, { type CouponVO } from '@/api/coupon';

const couponList = ref<CouponVO[]>([]);

// 加载优惠券列表
const loadCoupons = async () => {
  try {
    uni.showLoading({ title: '加载中...' });
    const res = await CouponAPI.list();
    couponList.value = res.data || [];
  } catch (error) {
    console.error('加载优惠券失败:', error);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    uni.hideLoading();
  }
};

// 领取优惠券
const handleReceive = async (coupon: CouponVO) => {
  try {
    uni.showLoading({ title: '领取中...' });
    const res = await CouponAPI.receive(coupon.id);
    console.log('领取优惠券响应:', res);
    uni.showToast({ title: '领取成功', icon: 'success' });
    // 刷新列表
    setTimeout(() => loadCoupons(), 500);
  } catch (error: any) {
    console.error('领取优惠券失败:', error);
    // 即使报错，也可能是响应解析问题，延迟刷新列表确认
    setTimeout(() => {
      loadCoupons();
      uni.showToast({ title: '请刷新查看领取结果', icon: 'none' });
    }, 500);
  } finally {
    uni.hideLoading();
  }
};

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return dateStr.substring(0, 10);
};

onMounted(() => {
  loadCoupons();
});
</script>

<style scoped lang="scss">
.coupon-center {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
  padding: 40rpx 30rpx;
  color: #fff;

  .title {
    font-size: 36rpx;
    font-weight: bold;
  }
}

.coupon-list {
  padding: 20rpx;
  height: calc(100vh - 140rpx);
}

.coupon-card {
  display: flex;
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
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
  margin-bottom: 15rpx;
}

.info {
  display: flex;
  gap: 20rpx;
  margin-bottom: 15rpx;

  text {
    font-size: 22rpx;
    color: #666;
    padding: 4rpx 12rpx;
    background-color: #f5f5f5;
    border-radius: 8rpx;
  }
}

.time {
  font-size: 22rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.action {
  display: flex;
  justify-content: flex-end;

  button {
    padding: 12rpx 32rpx;
    font-size: 24rpx;
    border-radius: 32rpx;
    border: none;
    line-height: 1.5;
    
    &::after {
      border: none;
    }
  }

  .receive-btn {
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
    color: #fff;
  }

  .received-btn {
    background-color: #f5f5f5;
    color: #999;
  }

  .soldout-btn {
    background-color: #f5f5f5;
    color: #999;
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
