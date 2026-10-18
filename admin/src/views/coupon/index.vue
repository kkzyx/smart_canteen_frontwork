<script lang="ts" setup>
import { Search, Plus } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getCouponPage, addCoupon, updateCoupon, deleteCoupon, updateCouponStatus } from "@/api/coupon";

const loading = ref(false);
const total = ref(0);
const dialogVisible = ref(false);
const dialogTitle = ref("");
const formRef = ref();

const queryParams = reactive({
  name: "",
  type: undefined,
  status: undefined,
  page: 1,
  pageSize: 10,
});

const formData = reactive({
  id: undefined,
  name: "",
  type: 1,
  discountAmount: undefined,
  discountRate: undefined,
  minAmount: 0,
  totalCount: 100,
  perLimit: 1,
  startTime: "",
  endTime: "",
  status: 1,
  description: "",
});

const tableData = ref([]);

const typeOptions = [
  { label: "满减券", value: 1 },
  { label: "折扣券", value: 2 },
  { label: "无门槛券", value: 3 },
];

const formRules = {
  name: [{ required: true, message: "请输入优惠券名称", trigger: "blur" }],
  type: [{ required: true, message: "请选择优惠券类型", trigger: "change" }],
  totalCount: [{ required: true, message: "请输入发行总量", trigger: "blur" }],
  perLimit: [{ required: true, message: "请输入限领数量", trigger: "blur" }],
  startTime: [{ required: true, message: "请选择开始时间", trigger: "change" }],
  endTime: [{ required: true, message: "请选择结束时间", trigger: "change" }],
};

// 查询数据
const loadData = async () => {
  loading.value = true;
  try {
    const res = await getCouponPage(queryParams);
    tableData.value = res.data.records;
    total.value = res.data.total;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 查询
const handleQuery = () => {
  queryParams.page = 1;
  loadData();
};

// 重置
const handleReset = () => {
  queryParams.name = "";
  queryParams.type = undefined;
  queryParams.status = undefined;
  handleQuery();
};

// 新增
const handleAdd = () => {
  dialogTitle.value = "新增优惠券";
  resetForm();
  dialogVisible.value = true;
};

// 编辑
const handleEdit = (row: any) => {
  dialogTitle.value = "编辑优惠券";
  Object.assign(formData, row);
  dialogVisible.value = true;
};

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm("确定要删除该优惠券吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    await deleteCoupon(row.id);
    ElMessage.success("删除成功");
    loadData();
  });
};

// 状态切换
const handleStatusChange = async (row: any) => {
  try {
    await updateCouponStatus(row.status, row.id);
    ElMessage.success("状态修改成功");
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1;
    ElMessage.error("状态修改失败");
  }
};

// 提交表单
const handleSubmit = async () => {
  await formRef.value.validate();
  try {
    if (formData.id) {
      await updateCoupon(formData);
      ElMessage.success("修改成功");
    } else {
      await addCoupon(formData);
      ElMessage.success("新增成功");
    }
    dialogVisible.value = false;
    loadData();
  } catch (error) {
    console.error(error);
  }
};

// 重置表单
const resetForm = () => {
  formData.id = undefined;
  formData.name = "";
  formData.type = 1;
  formData.discountAmount = undefined;
  formData.discountRate = undefined;
  formData.minAmount = 0;
  formData.totalCount = 100;
  formData.perLimit = 1;
  formData.startTime = "";
  formData.endTime = "";
  formData.status = 1;
  formData.description = "";
  formRef.value?.clearValidate();
};

// 关闭对话框
const handleDialogClose = () => {
  resetForm();
};

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return "";
  return date.replace("T", " ").substring(0, 19);
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="app-container">
    <!-- 查询表单 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryParams" inline>
        <el-form-item label="优惠券名称">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入优惠券名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-select
            v-model="queryParams.type"
            placeholder="请选择类型"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" :icon="Plus" @click="handleAdd">新增优惠券</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="优惠券名称" min-width="150" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.type === 1" type="success">满减券</el-tag>
            <el-tag v-else-if="row.type === 2" type="warning">折扣券</el-tag>
            <el-tag v-else type="info">无门槛券</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优惠内容" width="120">
          <template #default="{ row }">
            <span v-if="row.type === 1 || row.type === 3">¥{{ row.discountAmount }}</span>
            <span v-else>{{ (row.discountRate * 10).toFixed(1) }}折</span>
          </template>
        </el-table-column>
        <el-table-column prop="minAmount" label="使用门槛" width="100">
          <template #default="{ row }">
            {{ row.minAmount > 0 ? `满¥${row.minAmount}` : "无门槛" }}
          </template>
        </el-table-column>
        <el-table-column label="库存" width="120">
          <template #default="{ row }">
            {{ row.remainCount }} / {{ row.totalCount }}
          </template>
        </el-table-column>
        <el-table-column prop="perLimit" label="限领" width="80" />
        <el-table-column label="有效期" min-width="180">
          <template #default="{ row }">
            <div>{{ formatDate(row.startTime) }}</div>
            <div>{{ formatDate(row.endTime) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleQuery"
        @current-change="handleQuery"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-form-item label="优惠券名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入优惠券名称" />
        </el-form-item>

        <el-form-item label="优惠券类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio :label="1">满减券</el-radio>
            <el-radio :label="2">折扣券</el-radio>
            <el-radio :label="3">无门槛券</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="formData.type === 1 || formData.type === 3"
          label="优惠金额"
          prop="discountAmount"
        >
          <el-input-number
            v-model="formData.discountAmount"
            :min="0"
            :precision="2"
            placeholder="请输入优惠金额"
          />
          <span style="margin-left: 10px">元</span>
        </el-form-item>

        <el-form-item v-if="formData.type === 2" label="折扣率" prop="discountRate">
          <el-input-number
            v-model="formData.discountRate"
            :min="0.1"
            :max="0.99"
            :step="0.01"
            :precision="2"
            placeholder="请输入折扣率"
          />
          <span style="margin-left: 10px">（0.1-0.99，如0.8表示8折）</span>
        </el-form-item>

        <el-form-item label="使用门槛" prop="minAmount">
          <el-input-number
            v-model="formData.minAmount"
            :min="0"
            :precision="2"
            placeholder="请输入使用门槛"
          />
          <span style="margin-left: 10px">元（0表示无门槛）</span>
        </el-form-item>

        <el-form-item label="发行总量" prop="totalCount">
          <el-input-number
            v-model="formData.totalCount"
            :min="1"
            placeholder="请输入发行总量"
          />
          <span style="margin-left: 10px">张</span>
        </el-form-item>

        <el-form-item label="每人限领" prop="perLimit">
          <el-input-number v-model="formData.perLimit" :min="1" placeholder="请输入限领数量" />
          <span style="margin-left: 10px">张</span>
        </el-form-item>

        <el-form-item label="有效期开始" prop="startTime">
          <el-date-picker
            v-model="formData.startTime"
            type="datetime"
            placeholder="选择开始时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="有效期结束" prop="endTime">
          <el-date-picker
            v-model="formData.endTime"
            type="datetime"
            placeholder="选择结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="优惠券描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入优惠券描述"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.app-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}
</style>
