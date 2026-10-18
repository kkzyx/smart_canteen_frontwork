<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header>
        <div class="header-btns">
          <el-button type="primary" icon="Plus" @click="handleAdd(0, 1)">新增学校</el-button>
          <el-button icon="Refresh" :loading="loading" @click="handleQuery">刷新列表</el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="tableData"
        row-key="id"
        border
        default-expand-all
        :tree-props="{ children: 'children' }"
      >
        <el-table-column prop="name" label="名称" min-width="200" />
        <el-table-column prop="code" label="编码" width="150" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">
              {{ row.type === 1 ? '学校' : row.type === 2 ? '校区' : '宿舍楼' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.type < 3" 
              link 
              type="primary" 
              @click="handleAdd(row.id, row.type + 1)"
            >新增下级</el-button>
            
            <el-button link type="warning" @click="handleEdit(row)">编辑</el-button>
            
            <el-popconfirm title="确定删除吗？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="formTitle" v-model="dialogVisible" width="500px" append-to-body>
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="编码">
          <el-input v-model="form.code" placeholder="如: THU_MAIN" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import SchoolAPI, { SchoolNode } from "@/api/school";

const loading = ref(false);
const submitLoading = ref(false);
const tableData = ref<SchoolNode[]>([]);
const dialogVisible = ref(false);
const formTitle = ref('');

// 使用接口定义初始表单状态
const form = reactive<SchoolNode>({
  id: undefined,
  parentId: 0,
  name: '',
  code: '',
  type: 1,
  sort: 0,
});

/**
 * 获取全量树形列表
 */
const handleQuery = async () => {
  loading.value = true;
  try {
    const res = await SchoolAPI.getTree();
    tableData.value = res.data; // TypeScript 自动推断 SchoolNode[]
  } catch (err: any) {
    ElMessage.error(err.msg || "获取数据失败");
  } finally {
    loading.value = false;
  }
};

/**
 * 状态标签颜色映射
 */
const getTypeTag = (type: number) => {
  const map: Record<number, string> = {
    1: 'success',
    2: 'warning',
    3: 'info'
  };
  return map[type] || 'info';
};

/**
 * 新增节点初始化
 */
const handleAdd = (parentId: number, type: 1 | 2 | 3) => {
  Object.assign(form, {
    id: undefined,
    parentId,
    type,
    name: '',
    code: '',
    sort: 0
  });
  formTitle.value = `新增${type === 2 ? '校区' : type === 3 ? '宿舍楼' : '学校'}`;
  dialogVisible.value = true;
};

/**
 * 编辑节点初始化
 */
const handleEdit = (row: SchoolNode) => {
  Object.assign(form, row);
  formTitle.value = '编辑节点';
  dialogVisible.value = true;
};

/**
 * 提交保存/更新
 */
const submitForm = async () => {
  submitLoading.value = true;
  try {
    await SchoolAPI.saveOrUpdate(form);
    ElMessage.success('操作成功，Redis缓存已同步刷新');
    dialogVisible.value = false;
    handleQuery();
  } finally {
    submitLoading.value = false;
  }
};

/**
 * 删除节点
 */
const handleDelete = async (id: number) => {
  try {
    await SchoolAPI.delete(id);
    ElMessage.success('删除成功');
    handleQuery();
  } catch (err: any) {
    ElMessage.error(err.msg || "删除失败");
  }
};

onMounted(() => {
  handleQuery();
});
</script>

<style scoped>
.app-container { padding: 20px; }
.header-btns { margin-bottom: 10px; }
.flex-between { display: flex; justify-content: space-between; align-items: center; }
</style>