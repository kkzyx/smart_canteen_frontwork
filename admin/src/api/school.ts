import request from "@/utils/request";

//统一管理学校模块的BaseUrl
const SCHOOL_BASE_URL = "/school";

export const baseUrls = {
  tree: `${SCHOOL_BASE_URL}/tree`,
  save: `${SCHOOL_BASE_URL}/save`,
  delete: (id: number | string) => `${SCHOOL_BASE_URL}/${id}`,
};

class SchoolAPI {
  /**
   * 获取全量学校树形结构 (包含学校-校区-楼栋)
   * 优先从 Redis 获取，若无则查询数据库并缓存
   */
  static getTree() {
    return request<any, SchoolNode[]>({
      url: baseUrls.tree,
      method: "get",
    });
  }

  /**
   * 保存或更新学校节点
   * 操作成功后会自动清理后端 Redis 缓存
   * @param data 学校结构实体
   */
  static saveOrUpdate(data: SchoolNode) {
    return request<any, ResponseData>({
      url: baseUrls.save,
      method: "post",
      data,
    });
  }

  /**
   * 删除学校节点
   * @param id 节点ID
   */
  static delete(id: number | string) {
    return request<any, ResponseData>({
      url: baseUrls.delete(id),
      method: "delete",
    });
  }
}

export default SchoolAPI;

/** 学校结构实体接口 */
export interface SchoolNode {
  /** 主键ID */
  id?: number;
  /** 父级ID (0表示顶层学校) */
  parentId: number;
  /** 名称 */
  name: string;
  /** 自定义编码 (如: THU) */
  code: string;
  /** 层级类型: 1-学校, 2-校区, 3-宿舍楼 */
  type: 1 | 2 | 3;
  /** 排序 */
  sort?: number;
  /** 子节点列表 */
  children?: SchoolNode[];
}