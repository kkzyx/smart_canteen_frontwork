import request from '@/utils/request'

/**
 * 优惠券API
 */

// 分页查询优惠券
export function getCouponPage(params: any) {
  return request({
    url: '/store/coupon/page',
    method: 'get',
    params
  })
}

// 新增优惠券
export function addCoupon(data: any) {
  return request({
    url: '/store/coupon',
    method: 'post',
    data
  })
}

// 修改优惠券
export function updateCoupon(data: any) {
  return request({
    url: '/store/coupon',
    method: 'put',
    data
  })
}

// 删除优惠券
export function deleteCoupon(id: number) {
  return request({
    url: `/store/coupon/${id}`,
    method: 'delete'
  })
}

// 启用/禁用优惠券
export function updateCouponStatus(status: number, id: number) {
  return request({
    url: `/store/coupon/status/${status}`,
    method: 'post',
    params: { id }
  })
}

// 根据id查询优惠券
export function getCouponById(id: number) {
  return request({
    url: `/store/coupon/${id}`,
    method: 'get'
  })
}
