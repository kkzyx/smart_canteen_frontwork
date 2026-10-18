<template>
  <div class="app-container">
    <el-card v-loading="loading" element-loading-text="AI 正在深度分析中...">
      <template #header>
        <div class="header-content">
          <div class="title">
            <el-icon style="margin-right: 8px; color: #409eff;"><Cpu /></el-icon>
            <span>智能采购建议助手</span>
          </div>
          <el-date-picker
            v-model="queryDate"
            type="date"
            placeholder="选择统计日期"
            value-format="YYYY-MM-DD"
            :disabled-date="(time: Date) => time.getTime() > Date.now()"
            @change="handleDateChange"
          />
        </div>
      </template>

      <div class="main-content">
        <div v-if="report.summary" class="summary-section" style="margin-bottom: 20px;">
          <el-alert
            title="当日运营分析"
            type="success"
            :description="report.summary"
            :closable="false"
            show-icon
          />
        </div>

        <el-table
          v-if="report.purchaseList && report.purchaseList.length > 0"
          :data="report.purchaseList"
          border
          stripe
          style="width: 100%"
        >
          <el-table-column label="序号" type="index" width="60" align="center" />
          <el-table-column prop="ingredient" label="食材名称" width="180" align="center" />
          <el-table-column label="建议采购量" width="150" align="center">
            <template #default="scope">
              <span class="amount-text">{{ scope.row.amount }}</span>
              <span class="unit-text">{{ scope.row.unit }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="采购依据 (AI 换算逻辑)" />
        </el-table>

        <el-empty 
          v-else-if="!loading" 
          :description="`${queryDate} 当天并无订单数据`" 
        />

        <div v-if="report.purchaseList && report.purchaseList.length > 0" class="footer-btns">
          <el-button type="primary" @click="handleExport">导出采购单</el-button>
          <el-button type="success" plain @click="handleSaveOrder">保存为待处理采购单</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AiAPI, { AiPurchaseReportVO } from "@/api/ai";
import { ElMessage } from "element-plus";
import { Cpu } from "@element-plus/icons-vue"; // 记得导入图标
import dayjs from 'dayjs';

const loading = ref(false);

// 初始化日期为昨天
const queryDate = ref(dayjs().subtract(1, 'day').format('YYYY-MM-DD'));

const report = ref<AiPurchaseReportVO>({
  summary: '',
  purchaseList: []
});

const fetchAdvice = async (targetDate?: string) => {
  const dateStr = targetDate || queryDate.value;
  if (!dateStr) return;

  loading.value = true;
  report.value = { summary: '', purchaseList: [] };
  
  try {
    const res = await AiAPI.getPurchaseAdvice(dateStr);
    if (res.code === 1 || res.code === 200) {
      report.value = res.data || { summary: '', purchaseList: [] };

      if (!report.value.purchaseList || report.value.purchaseList.length === 0) {
        ElMessage.warning(`${dateStr} 当天并无订单数据`);
      } else {
        ElMessage.success(`${dateStr} 报告生成成功`);
      }
    } else {
      ElMessage.error(res.msg || "获取失败");
    }
  } catch (error: any) {
    console.error("AI 获取失败", error);
    ElMessage.error("获取 AI 建议失败，请检查网络或后端配置");
  } finally {
    loading.value = false;
  }
};

const handleDateChange = (val: string) => {
  fetchAdvice(val);
};

const handleExport = () => { ElMessage.info("导出功能开发中..."); };
const handleSaveOrder = () => { ElMessage.info("保存功能开发中..."); };

onMounted(() => {
  fetchAdvice();
});
</script>

<style scoped>
/* 保持你之前的样式即可 */
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}
.amount-text {
  color: #f56c6c;
  font-weight: bold;
  font-size: 16px;
  margin-right: 4px;
}
.unit-text {
  color: #909399;
}
.footer-btns {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}
.main-content {
  min-height: 400px;
}
</style>