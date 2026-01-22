import request from "@/utils/request";

const COUPON_BASE_URL = "/client/coupon";

const api = {
  list: `${COUPON_BASE_URL}/list`,
  receive: `${COUPON_BASE_URL}/receive`,
  my: `${COUPON_BASE_URL}/my`,
  available: `${COUPON_BASE_URL}/available`,
};

class CouponAPI {
  /**
   * 查询可领取的优惠券列表
   */
  static list() {
    return request.get<CouponVO[]>(api.list);
  }

  /**
   * 领取优惠券
   */
  static receive(couponId: number) {
    return request.post<any>(`${api.receive}/${couponId}`, {});
  }

  /**
   * 查询我的优惠券
   * @param status 状态 0-未使用 1-已使用 2-已过期
   */
  static my(status?: number) {
    return request.get<UserCouponVO[]>(api.my, { status });
  }

  /**
   * 查询订单可用优惠券
   */
  static available(orderAmount: number) {
    return request.get<UserCouponVO[]>(api.available, { orderAmount });
  }
}

export default CouponAPI;

/**
 * 优惠券VO
 */
export interface CouponVO {
  id: number;
  name: string;
  type: number; // 1-满减券 2-折扣券 3-无门槛券
  discountAmount?: number;
  discountRate?: number;
  minAmount: number;
  totalCount: number;
  remainCount: number;
  perLimit: number;
  startTime: string;
  endTime: string;
  status: number;
  description: string;
  received?: boolean;
  receivedCount?: number;
}

/**
 * 用户优惠券VO
 */
export interface UserCouponVO {
  id: number;
  couponId: number;
  name: string;
  type: number;
  discountAmount?: number;
  discountRate?: number;
  minAmount: number;
  startTime: string;
  endTime: string;
  description: string;
  status: number; // 0-未使用 1-已使用 2-已过期
  receiveTime: string;
  useTime?: string;
  canUse?: boolean;
}
