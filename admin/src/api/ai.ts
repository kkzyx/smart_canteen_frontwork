import request from "@/utils/request";

const AI_BASE_URL = "/store/ai";

/**
 * AI 智能助手 API
 */
class AiAPI {
  /**
   * 获取 AI 智能采购建议报告
   * @param date 查询日期，格式：YYYY-MM-DD
   */
  static getPurchaseAdvice(date: string) {
    return request<any, ResponseData<AiPurchaseReportVO>>({
      url: `${AI_BASE_URL}/purchase-advice`,
      method: "get",
      params: { date },
    });
  }
}

export default AiAPI;

/**
 * AI 采购报告返回对象
 */
export interface AiPurchaseReportVO {
  /** 统计摘要描述 */
  summary: string;
  /** 具体的采购清单列表 */
  purchaseList: AiPurchaseAdviceVO[];
}

/**
 * AI 采购清单明细对象
 */
export interface AiPurchaseAdviceVO {
  /** 食材名称 */
  ingredient: string;
  /** 建议采购量 */
  amount: number;
  /** 单位 */
  unit: string;
  /** 采购依据及换算理由 */
  reason: string;
}