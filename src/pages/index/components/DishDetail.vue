<template>
	<view class="dish-detail-page">
		<!-- 菜品图片 -->
		<view class="dish-image-container">
			<up-image
				:src="Object.keys(dish).length > 0 ? dish.image : setmeal.image"
				width="100%"
				height="400rpx"
				radius="20rpx" />
		</view>

		<!-- 菜品信息 -->
		<view class="dish-info">
			<text class="brand">锦食坊</text>
			<text class="dish-name">{{
				Object.keys(dish).length > 0 ? dish.name : setmeal.name
			}}</text>
			<br />
			<text class="dish-description"
				>描述：{{
					Object.keys(dish).length > 0
						? dish.description
						: setmeal.description || "暂无描述"
				}}</text
			>
			<text class="price"
				>¥{{ Object.keys(dish).length > 0 ? dish.price : setmeal.price }}</text
			>

			<br />
			<text
				class="setmeal-detail"
				v-if="setmealDishList.length > 0">
				套餐详情：
				<text
					v-for="(item, index) in setmealDishList"
					:key="index"
					>{{ item.name
					}}{{ index === setmealDishList.length - 1 ? "" : "、" }}</text
				>
			</text>
			<br />
			<text class="dish-category"
				>分类：{{
					Object.keys(dish).length > 0
						? dish.categoryName
						: setmeal.categoryName
				}}</text
			>
		</view>

		<!-- 商品评价 -->
		<view class="comment-container">
			<view class="comment-header dis-flex flex-y-center flex-x-between">
				<text class="f-w f-28">商品评价</text>
				<view
					class="more-comments dis-flex flex-y-center"
					@click="goToCommentPage">
					<text
						class="f-22"
						style="color: #818181"
						>更多评价({{ commentTotal }})</text
					>
					<up-icon
						name="arrow-right"
						color="#818181"
						size="12"
						class="ml-10" />
				</view>
			</view>

			<view class="comment-list">
				<!-- 评论列表 -->
				<view
					class="comment-item mb-20"
					v-if="displayComments.length !== 0"
					v-for="(comment, index) in displayComments"
					:key="index">
					<view
						class="dis-flex flex-y-center mb-10"
						style="padding: 10rpx">
						<up-avatar
							:src="comment.image || '/static/default-avatar.png'"
							customStyle="padding-top:10rpx;width: 80rpx; height: 20rpx; margin-right: 10rpx; margin-bottom:20rpx" />
						<text class="f-24">{{ comment.authorName }}</text>
					</view>
					<view class="comment-content f-24 mb-10">
						{{
							comment.content.length > 25
								? comment.content.slice(0, 25) + "..."
								: comment.content
						}}
					</view>
					<view
						class="comment-date f-20"
						style="color: #818181">
						{{ formatTime(comment.createdTime) }}
					</view>
				</view>
				<!-- 无评论 -->
				<view
					v-else
					class="no-comments f-24"
					style="text-align: center; color: #999; padding: 40rpx 0">
					<image
						style="
							display: block;
							width: 200rpx;
							height: 200rpx;
							margin: 0 auto 20rpx;
						"
						src="/static/no-comment.png"
						mode="aspectFit" />
					<text>暂无评论，快来抢沙发吧！</text>
				</view>
			</view>
		</view>

		<!-- 商家推荐 -->
		<transition name="fade-up">
			<view class="recommend-section">
			<view class="section-header">
				<view class="header-left">
					<text class="section-title">商家推荐</text>
					<text class="recommend-count">为你精选</text>
				</view>
			</view>

			<scroll-view scroll-x class="recommend-scroll">
				<view class="recommend-list">
					<!-- 推荐商品 -->
					<view
						class="recommend-item"
						v-for="(item, index) in recommendList"
						:key="index"
						@click="handleDishClick(item)">
						<view class="recommend-image-wrapper">
							<up-image
								:src="item.image"
								width="100%"
								height="240rpx"
								radius="16rpx"
								mode="aspectFill" />
							<view class="recommend-badge">
								<text class="badge-text">推荐</text>
							</view>
						</view>

						<view class="recommend-info">
							<text class="dish-name">{{ item.name }}</text>

							<view class="price-action">
								<view class="price-wrapper">
									<text class="price-symbol">¥</text>
									<text class="price-value">{{ item.price }}</text>
								</view>

								<view class="action-btn" @click.stop>
									<view
										v-if="item.flavors && item.flavors.length > 0"
										@click="handleDishFlavors(item)"
										class="spec-btn">
										<text class="btn-text">选择规格</text>
										<up-badge
											absolute
											max="99"
											:offset="[-6, -6]"
											bgColor="#ff6b6b"
											numberType="overflow"
											:value="shoppingCartStore.getBadgeByItemId(item.id)" />
									</view>
									<view
										class="add-cart-btn"
										@click="handleCommentAddCart(item)"
										v-else>
										<up-icon name="plus-circle-fill" color="#fff" size="20" />
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
			</view>
		</transition>

		<!-- 底部操作 -->
		<view class="bottom-action">
			<view class="action-wrapper">
				<view class="left-actions">
					<view class="action-item" @click="onMoreAction">
						<up-icon name="more-dot-fill" color="#333" size="18" />
						<text class="action-text">更多</text>
					</view>
					<view class="action-item" @click="onService">
						<up-icon name="server-fill" color="#333" size="18" />
						<text class="action-text">客服</text>
					</view>
					<view class="action-item" @click="handleShowCartPopup">
						<view class="cart-icon-wrapper">
							<up-icon name="shopping-cart-fill" color="#333" size="18" />
							<up-badge
								absolute
								:offset="[-14, -10]"
								max="99"
								:value="totalNum"
								color="#fff"
								:bgColor="'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)'"
								shape="horn"
								:show="totalNum > 0" />
						</view>
						<text class="action-text">购物车</text>
					</view>
				</view>

				<view class="right-actions">
					<view v-if="!dish.flavors?.length" class="action-buttons">
						<up-button
							type="primary"
							text="加入购物车"
							@click="handleAddCart"
							:customStyle="{
								background: 'linear-gradient(135deg, #FFE278 0%, #FFD54F 100%)',
								borderColor: 'transparent',
								borderRadius: '30rpx',
								marginRight: '20rpx',
								fontWeight: '600'
							}" />
						<up-button
							type="primary"
							:text="'立即下单 ¥' + (Object.keys(dish).length > 0 ? dish.price : setmeal.price)"
							@click="onOrdersSubmit"
							:customStyle="{
								background: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)',
								borderColor: 'transparent',
								borderRadius: '30rpx',
								fontWeight: '600',
								boxShadow: '0 4rpx 12rpx rgba(255, 107, 107, 0.3)'
							}" />
					</view>
					<view v-else class="spec-button-wrapper" @click.stop="handleDishFlavors(dish)">
						<up-button
							type="primary"
							text="选择规格"
							shape="circle"
							:customStyle="{
								width: '400rpx',
								height: '88rpx',
								borderRadius: '44rpx',
								fontSize: '30rpx',
								fontWeight: '600',
								background: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)',
								borderColor: 'transparent',
								boxShadow: '0 4rpx 12rpx rgba(255, 107, 107, 0.3)'
							}" />
						<up-badge
							absolute
							max="99"
							:offset="[-6, -6]"
							:bgColor="'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)'"
							numberType="overflow"
							:value="shoppingCartStore.getBadgeByItemId(dish.id)" />
					</view>
				</view>
			</view>
		</view>

		<!-- 购物车弹出层 -->
		<CardPopup
			:show-cart-popup="showCartPopup"
			@on-close="closeCartPopup" />
		<!-- 口味弹窗 -->
		<DishFlavorModel
			ref="JDishFlavorModel"
			:title="dishFlavorModel.title" />
	</view>
</template>

<script lang="ts" setup>
	import { CommentVO } from "@/api/comment"
	import CardPopup from "@/components/card-popup/index.vue"
	import CommentAPI, { CommentDto } from "@/api/comment"
	import { ref, onMounted } from "vue"
	import { onShow } from "@dcloudio/uni-app"
	import { useShoppingCartStore } from "@/store"
	import { ShoppingCart } from "@/api/shopping-cart"
	import { getCurrentInstance } from "vue"
	import DishAPI, { type DishVO } from "@/api/dish"
	import { checkLogin } from "@/core/app"
	import { CategoryTypeEnum } from "@/enums/CategoryEnum"
	import { formatTime } from "@/utils/util"
	import DishFlavorModel from "./DishFlavorModel.vue"
	import SetmealAPI, { SetmealVO } from "@/api/setmeal"
	import ItemViewAPI from "@/api/item-view"

	// 获取当前页面实例
	const instance = getCurrentInstance()
	const proxy = instance?.proxy

	//购物车store
	const shoppingCartStore = useShoppingCartStore()
	//购物车列表
	const cartList = ref<ShoppingCart[]>([])
	//菜品列表
	const dishList = ref<DishVO[]>([])
	//套餐详情包含的菜品列表
	const setmealDishList = ref<DishVO[]>([])
	const showCartPopup = ref(false)
	const { totalNum } = storeToRefs(shoppingCartStore)
	const dishFlavorModel = reactive({
		title: "",
	})
	const JDishFlavorModel = ref<InstanceType<typeof DishFlavorModel>>()
	// 接收从上一页传来的 dish 参数
	const dish = ref<DishVO>({})
	//接收从上一页传来的 setmeal 参数
	const setmeal = ref<SetmealVO>({})
	//选择规格
	const handleDishFlavors = (dish: DishVO) => {
		dishFlavorModel.title = dish.name || "选择菜品口味"
		JDishFlavorModel.value?.show(dish)
	}

	// 添加评价相关数据
	const commentTotal = ref() // 评价总数
	const comments = ref<CommentVO[]>([])

	// 添加推荐商品数据
	const recommendList = ref<DishVO[]>([])

	// 计算显示的评价（只显示前两条）
	const displayComments = computed(() => {
		if (!comments.value) return []
		return comments.value.slice(0, 2)
	})

	// 获取评论列表
	const loadComments = async () => {
	try {
		// 添加参数验证
		if (!dish.value.id && !setmeal.value.id) {
		console.warn('菜品ID或套餐ID不存在，跳过评论加载')
		return
		}

		const params: CommentDto = {
		dishId: dish.value.id,
		setmealId: setmeal.value.id,
		minDate: new Date(),
		}
		
		console.log('评论加载参数:', params)
		const result = await CommentAPI.getCommentList(params)
		comments.value = result.data.records
		commentTotal.value = result.data.countCommentRepay
	} catch (error) {
		console.error("获取评论失败:", error)
	}
	}


	// 跳转到评论页面
	const goToCommentPage = () => {
		uni.navigateTo({
			url: `/pages/comment/index?dishId=${dish.value.id}&setmealId=${setmeal.value.id}`,
		})
	}

	const closeCartPopup = () => {
		showCartPopup.value = false
	}

	// 页面加载时获取参数并请求菜品数据
	onMounted(async () => {
	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1]
	const options = currentPage.options

	// 检查参数是否存在
	console.log('页面参数:', options)
	
	if (options && options.dish) {
		try {
		const dishParam = JSON.parse(decodeURIComponent(options.dish))
		console.log('解析后的菜品参数:', dishParam)
		
		if (dishParam.type === CategoryTypeEnum.DISH) {
			dish.value = dishParam
			console.log('菜品对象已初始化:', dish.value)
			ItemViewAPI.incrementDishViewCount(dish.value.id as number)
		} else {
			setmeal.value = dishParam
			console.log('套餐对象已初始化:', setmeal.value)
			await fetchSetmealDetail()
		}
		} catch (error) {
		console.error('参数解析失败:', error)
		}
	} else {
		console.warn('未接收到dish参数')
	}

	await fetchRecommendDishes()
	await loadComments()
	})



	//获取套餐详情
	function fetchSetmealDetail() {
		SetmealAPI.getSetmealOfDishList(setmeal.value.id).then(res => {
			// console.log("获取套餐详情:", res.data)
			setmealDishList.value = res.data
		})
	}

	//获取推荐菜品
	async function fetchRecommendDishes() {
		try {
			const res = await DishAPI.getRecommendDish()
			//添加type属性
			const dishes =
				res.data?.map(v => ({ ...v, type: CategoryTypeEnum.DISH })) || []
			recommendList.value = dishes || []
		} catch (error) {
			console.error("获取推荐菜品失败:", error)
		}
	}

	// 显示购物车弹出层
	const handleShowCartPopup = () => {
		// 没有商品，不允许打开弹出层
		if (totalNum.value <= 0) {
			return
		}
		showCartPopup.value = !showCartPopup.value
	}
	//加入购物车
	const handleAddCart = async () => {
		const isContinue = checkLogin()
		if (!isContinue) {
			navToLogin()
			return
		}

		const idKey =
			dish.value.type === CategoryTypeEnum.DISH ? "dishId" : "setmealId"

		dish.value.number = (dish.value.number || 0) + 1
		await shoppingCartStore.addCart({
			name: dish.value.name,
			image: dish.value.image,
			amount: dish.value.price,
			number: dish.value.number,
			dishFlavor: "",
			[idKey]: dish.value.id,
		})
		await shoppingCartStore.getCartlist()
	}

	//推荐商品加入购物车
	function handleCommentAddCart(item: DishVO) {
		const isContinue = checkLogin()
		if (!isContinue) {
			navToLogin()
			return
		}

		const idKey = "dishId"
		item.number = (item.number || 0) + 1
		shoppingCartStore
			.addCart({
				name: item.name,
				image: item.image,
				amount: item.price,
				number: item.number,
				dishFlavor: "",
				[idKey]: item.id,
			})
			.then(() => {
				shoppingCartStore.getCartlist()
			})
	}

	// 使用本地存储数据更新菜品列表中选择的菜品数量
	function updateDishNumber(ids?: number | number[]) {
		const c = (uni.getStorageSync("cart") || []) as ShoppingCart[]

		// 无本地存储，证明数据购物车中没有数据
		if (c.length === 0) {
			dishList.value.forEach(dish => (dish.number = 0))
			return
		}

		// 如果传入的是单个菜品的 ID
		if (typeof ids === "number") {
			const cartItem = c.find(v => v.dishId === ids || v.setmealId === ids)
			const index = dishList.value.findIndex(v => v.id === ids)
			// 增加边界检查
			if (index !== -1 && dishList.value[index]) {
				dishList.value[index].number = cartItem?.number ?? 0
			}
			return
		}

		if (Array.isArray(ids)) {
			// 如果传入的是多个菜品的 ID
			for (const id of ids) {
				const cartItem = c.find(v => v.dishId === id || v.setmealId === id)
				const index = dishList.value.findIndex(v => v.id === id)
				if (index !== -1 && dishList.value[index]) {
					dishList.value[index].number = cartItem?.number ?? 0
				}
			}
		} else {
			// 如果没有传入参数，将所有菜品数量重置为 0
			for (const dish of dishList.value) {
				dish.number = 0
			}
		}
	}
	async function getCartList() {
		return shoppingCartStore.getCartlist().then(res => {
			cartList.value = res.data || []
			const ids = res.data.map(v => v.dishId || v.setmealId)
			// 更新菜品列表（菜品数量）
			updateDishNumber(ids as number[])
			return cartList.value // 返回购物车列表
		})
	}

	//点击菜品进入详情页
	function handleDishClick(dish: DishVO) {
		// console.log("点击菜品进入详情页", dish)
		// 将整个dish对象序列化后传递
		const dishParam = encodeURIComponent(JSON.stringify(dish))
		uni.navigateTo({
			url: `/pages/index/components/DishDetail?dish=${dishParam}`,
		})
	}
	// 新增 onShow，在每次页面显示时调用
	onShow(async () => {
	// 确保有有效ID才加载评论
	if (dish.value.id || setmeal.value.id) {
		await loadComments()
	}
	})


	// 创建订单，订单确认
	async function onOrdersSubmit() {
		const currentCartList = await getCartList()
		//只有当购物车没有商品时才添加当前商品
		if (currentCartList.length === 0) {
			// console.log("购物车长度:", cartList.value.length)
			await handleAddCart() // 也等待添加完成
		}

		proxy?.$navTo("pages/order/index")
	}

	/**
	 * 提示前往登录
	 */
	function navToLogin() {
		uni.showModal({
			title: "🐱‍🐉温馨提示",
			content: "需要先登录才能点单哦~",
			confirmText: "去登录",
			cancelText: "再看看",
			success: res => {
				if (res.confirm) {
					uni.navigateTo({
						url: "/pages/login/index",
					})
				} else if (res.cancel && getCurrentPages().length > 1) {
					uni.navigateBack()
				}
			},
		})
	}

	// 点击更多按钮
	const onMoreAction = () => {
		proxy?.$toast("暂未开放，敬请期待")
	}
	// 客服热线
	const onService = () => {
		uni.navigateTo({
			url: "/pages/message/customer-service",
		})
	}
</script>

<style lang="scss" scoped>
	$offset-bottom: 140rpx;
	$primary-gradient: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%);
	$card-shadow: 0 6rpx 20rpx rgba(255, 107, 107, 0.1);
	$card-border: 2rpx solid rgba(255, 107, 107, 0.1);

	// 过渡动画
	.fade-up-enter-active,
	.fade-up-leave-active {
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.fade-up-enter-from {
		opacity: 0;
		transform: translateY(30rpx);
	}

	.fade-up-leave-to {
		opacity: 0;
		transform: translateY(-30rpx);
	}

	.dish-detail-page {
		padding: 30rpx;
		background: linear-gradient(180deg, #fff8f5 0%, #ffffff 100%);
		min-height: 100vh;
		padding-bottom: calc($offset-bottom + 30rpx);

		// 菜品图片区域
		.dish-image-container {
			margin-bottom: 30rpx;
			border-radius: 24rpx;
			overflow: hidden;
			box-shadow: $card-shadow;

			.image-wrapper {
				position: relative;
				width: 100%;
				height: 400rpx;
				border-radius: 24rpx;
				overflow: hidden;

				:deep(.u-image) {
					border-radius: 24rpx;
				}

				.image-overlay {
					position: absolute;
					bottom: 0;
					left: 0;
					right: 0;
					height: 120rpx;
					pointer-events: none;

					.overlay-gradient {
						width: 100%;
						height: 100%;
						background: linear-gradient(to top, rgba(0, 0, 0, 0.3), transparent);
					}
				}
			}
		}

		// 菜品信息卡片
		.dish-info-card {
			background: #ffffff;
			border-radius: 24rpx;
			padding: 32rpx;
			margin-bottom: 30rpx;
			box-shadow: $card-shadow;
			border: $card-border;
			transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

			.card-header {
				display: flex;
				align-items: center;
				gap: 16rpx;
				margin-bottom: 24rpx;

				.brand-tag {
					font-size: 24rpx;
					font-weight: 600;
					color: #fff;
					background: $primary-gradient;
					padding: 6rpx 16rpx;
					border-radius: 8rpx;
					box-shadow: 0 2rpx 8rpx rgba(255, 107, 107, 0.3);
				}

				.dish-name {
					font-size: 36rpx;
					font-weight: 700;
					color: #333;
					flex: 1;
				}
			}

			.card-body {
				.description-section,
				.info-row {
					margin-bottom: 20rpx;
				}

				.section-label {
					display: block;
					font-size: 26rpx;
					color: #999;
					margin-bottom: 8rpx;
				}

				.dish-description {
					font-size: 28rpx;
					color: #666;
					line-height: 1.6;
				}

				.setmeal-dishes {
					display: flex;
					flex-wrap: wrap;
					gap: 12rpx;

					.dish-tag {
						display: inline-block;
						padding: 8rpx 16rpx;
						background: linear-gradient(135deg, #fff8f5 0%, #ffffff 100%);
						border: 2rpx solid rgba(255, 107, 107, 0.15);
						border-radius: 8rpx;
						font-size: 24rpx;
						color: #666;
					}
				}

				.category-text {
					font-size: 28rpx;
					color: #666;
				}
			}

			.card-footer {
				margin-top: 24rpx;
				padding-top: 24rpx;
				border-top: 2rpx solid rgba(255, 107, 107, 0.1);

				.price-wrapper {
					display: flex;
					align-items: baseline;

					.price-symbol {
						font-size: 32rpx;
						font-weight: 600;
						background: $primary-gradient;
						-webkit-background-clip: text;
						-webkit-text-fill-color: transparent;
						background-clip: text;
					}

					.price-value {
						font-size: 48rpx;
						font-weight: 700;
						background: $primary-gradient;
						-webkit-background-clip: text;
						-webkit-text-fill-color: transparent;
						background-clip: text;
						margin-left: 4rpx;
					}
				}
			}
		}

		// 评论区域
		.comment-section {
			background: #ffffff;
			border-radius: 24rpx;
			padding: 32rpx;
			margin-bottom: 30rpx;
			box-shadow: $card-shadow;
			border: $card-border;

			.section-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 24rpx;

				.header-left {
					.section-title {
						font-size: 32rpx;
						font-weight: 700;
						color: #333;
						margin-right: 12rpx;
					}

					.comment-count {
						font-size: 24rpx;
						color: #999;
					}
				}

				.header-right {
					display: flex;
					align-items: center;
					gap: 8rpx;
					padding: 8rpx 16rpx;
					background: linear-gradient(135deg, #fff8f5 0%, #ffffff 100%);
					border-radius: 20rpx;
					border: 2rpx solid rgba(255, 107, 107, 0.15);
					transition: all 0.3s ease;

					&:active {
						transform: scale(0.95);
						background: linear-gradient(135deg, #fff 0%, #fff8f5 100%);
					}

					.more-text {
						font-size: 24rpx;
						color: #ff6b6b;
					}
				}
			}

			.comment-list {
				.comment-item {
					padding: 24rpx;
					background: linear-gradient(135deg, #fff8f5 0%, #ffffff 100%);
					border-radius: 16rpx;
					margin-bottom: 16rpx;
					border: 2rpx solid rgba(255, 107, 107, 0.08);
					transition: all 0.3s ease;

					&:active {
						transform: translateY(-2rpx);
						box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.15);
					}

					.comment-user {
						display: flex;
						align-items: center;
						gap: 16rpx;
						margin-bottom: 16rpx;

						.user-info {
							display: flex;
							flex-direction: column;
							gap: 4rpx;

							.user-name {
								font-size: 28rpx;
								font-weight: 600;
								color: #333;
							}

							.comment-time {
								font-size: 22rpx;
								color: #999;
							}
						}
					}

					.comment-content {
						font-size: 26rpx;
						color: #666;
						line-height: 1.6;
					}
				}

				.no-comments {
					display: flex;
					flex-direction: column;
					align-items: center;
					padding: 60rpx 0;

					image {
						width: 200rpx;
						height: 200rpx;
						margin-bottom: 20rpx;
					}

					.no-comment-text {
						font-size: 26rpx;
						color: #999;
					}
				}
			}
		}

		// 推荐区域
		.recommend-section {
			margin: 25rpx 30rpx;
			padding: 28rpx;
			background: linear-gradient(135deg, #fff8f5 0%, #ffffff 100%);
			border-radius: 28rpx;
			box-shadow: 0 6rpx 20rpx rgba(255, 107, 107, 0.1);
			border: 2rpx solid rgba(255, 107, 107, 0.15);

			.section-header {
				margin-bottom: 24rpx;

				.header-left {
					.section-title {
						font-size: 30rpx;
						font-weight: 700;
						color: #333;
						padding-left: 12rpx;
						border-left: 8rpx solid #ff6b6b;
						line-height: 1.2;
					}

					.recommend-count {
						font-size: 24rpx;
						color: #999;
					}
				}
			}

			.recommend-scroll {
				white-space: nowrap;

				.recommend-list {
					display: flex;
					gap: 24rpx;

					.recommend-item {
						display: inline-block;
						width: 290rpx;
						background: #ffffff;
						border-radius: 20rpx;
						padding: 24rpx;
						box-shadow: 0 6rpx 16rpx rgba(255, 107, 107, 0.08);
						border: 2rpx solid rgba(255, 107, 107, 0.1);
						transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

						&:active {
							transform: translateY(-6rpx);
							box-shadow: 0 10rpx 24rpx rgba(255, 107, 107, 0.15);
						}

						.recommend-image-wrapper {
							margin-bottom: 18rpx;
							border-radius: 14rpx;
							overflow: hidden;
						}

						.recommend-info {
							.dish-name {
								display: block;
								font-size: 30rpx;
								font-weight: 700;
								color: #333;
								margin-bottom: 12rpx;
							}

							.price-action {
								display: flex;
								align-items: center;
								justify-content: space-between;

								.price-wrapper {
									.price-symbol {
										font-size: 24rpx;
										font-weight: 600;
										color: #ff6b6b;
									}

									.price-value {
										font-size: 32rpx;
										font-weight: 700;
										color: #ff6b6b;
									}
								}
							}

							.action-btn {
								.spec-btn {
									position: relative;
									padding: 12rpx 24rpx;
									background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%);
									border-radius: 24rpx;
									box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);
									transition: all 0.3s ease;

									&:active {
										transform: scale(0.95);
										box-shadow: 0 2rpx 8rpx rgba(255, 107, 107, 0.2);
									}

									.btn-text {
										font-size: 24rpx;
										color: #fff;
										font-weight: 600;
									}
								}

								.add-cart-btn {
									width: 56rpx;
									height: 56rpx;
									background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%);
									border-radius: 50%;
									display: flex;
									align-items: center;
									justify-content: center;
									box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);
									transition: all 0.3s ease;

									&:active {
										transform: scale(0.9);
										box-shadow: 0 2rpx 8rpx rgba(255, 107, 107, 0.2);
									}
								}
							}
						}
					}
				}
			}
		}

		// 底部操作栏
		.bottom-action {
			position: fixed;
			bottom: 0;
			left: 0;
			width: 100%;
			height: $offset-bottom;
			padding-bottom: env(safe-area-inset-bottom);
			background: #ffffff;
			box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
			z-index: 100;

			.action-wrapper {
				display: flex;
				align-items: center;
				justify-content: space-between;
				height: 100%;
				padding: 0 30rpx;

				.left-actions {
					display: flex;
					align-items: center;
					gap: 32rpx;

					.action-item {
						display: flex;
						flex-direction: column;
						align-items: center;
						gap: 6rpx;
						transition: all 0.3s ease;

						&:active {
							transform: scale(0.9);
						}

						.cart-icon-wrapper {
							position: relative;
						}

						.action-text {
							font-size: 22rpx;
							color: #333;
						}
					}
				}

				.right-actions {
					display: flex;
					align-items: center;
					gap: 16rpx;

					.action-buttons {
						display: flex;
						align-items: center;
						gap: 16rpx;
					}

					.spec-button-wrapper {
						position: relative;
					}
				}
			}
		}
	}
</style>
