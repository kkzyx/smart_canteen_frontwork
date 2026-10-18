<template>
	<view class="order">
		<view class="logo-header">
			<view class="logo">
				<view class="custom-logo">
					<view class="logo-text">
						<text class="logo-main">食堂</text>
						<text class="logo-sub">CENTRAL CANTEEN</text>
					</view>
				</view>
			</view>

			<view class="store_info">
				<view class="store-header">
					<up-tag
						:text="isOperating ? '营业中' : '休息中'"
						size="mini"
						:type="isOperating ? 'error' : 'info'"
						:customStyle="{
							background: isOperating 
								? 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)' 
								: '#ccc',
							borderColor: 'transparent',
							boxShadow: isOperating 
								? '0 2rpx 8rpx rgba(102, 126, 234, 0.3)' 
								: 'none',
						}"
						borderColor="transparent" />
					<text class="store_name">食堂</text>
					<up-icon
						name="arrow-right"
						color="#000"
						size="15"></up-icon>
				</view>

				<view class="store-bottom">
					<view class="info-item">
						<text>距离您500m</text>
					</view>
					<view class="info-item">
						<up-icon name="clock" color="rgba(255,255,255,0.9)" size="14" />
						<text>营业时间 10:00-20:00</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 轮播图 -->
		<view class="swiper">
			<up-swiper
				:list="swiperList"
				keyName="image"
				indicator
				indicatorMode="line"
				:autoplay="true"
				circular />
		</view>

		<view
			class="notice"
			v-if="!isOperating">
			<up-notice-bar text="当前商家已休息，下单可选择预约配送时间" />
		</view>

		<!-- AI智能推荐菜品模块 -->
		<view class="ai-recommend-section">
			<view class="ai-input-container">
				<view class="input-wrapper">
					<text class="input-icon">🤖</text>
					<input
						v-model="aiInputText"
						class="ai-input"
						placeholder="说说你想吃什么？如：我想吃辣的、推荐清淡的菜..."
						@confirm="handleAiRecommend" />
				</view>
				<button
					class="recommend-btn"
					:class="{ loading: aiLoading }"
					@click="handleAiRecommend"
					:disabled="aiLoading">
					{{ aiLoading ? "推荐中..." : "推荐" }}
				</button>
			</view>

			<!-- AI推荐结果 -->
			<view
				v-if="aiRecommendList.length > 0"
				class="ai-recommend-results">
				<view class="results-header">
					<text class="results-title">为你推荐以下美食：</text>
				</view>
				<scroll-view
					scroll-x="true"
					class="recommend-scroll">
					<view class="recommend-list">
						<view
							v-for="(item, index) in aiRecommendList"
							:key="index"
							@click.self="handleDishClick(item)"
							class="recommend-item">
							<view class="recommend-image">
								<up-image
									:src="item.image"
									width="200rpx"
									height="150rpx"
									radius="10rpx" />
							</view>
							<view class="recommend-info">
								<text class="dish-name">{{ item.name }}</text>
								<text class="recommend-reason">{{ item.reason }}</text>
								<view class="price-action">
									<text class="price">¥{{ item.price }}</text>
									<up-button
										v-if="!item.flavors?.length"
										type="primary"
										size="mini"
										@click.stop="addToCart(item)"
										:customStyle="{
											background: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)',
											borderColor: 'transparent',
											borderRadius: '20rpx',
											boxShadow: '0 4rpx 12rpx rgba(255, 107, 107, 0.3)',
										}">
										加购物车
									</up-button>
									<view
										v-else
										@click.stop="handleDishFlavors(item)"
										style="position: relative">
										<up-button
											type="primary"
											text="选择规格"
											size="mini"
											shape="circle"
											:customStyle="{
												background: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)',
												borderColor: 'transparent',
												boxShadow: '0 4rpx 12rpx rgba(255, 107, 107, 0.3)',
											}" />

										<up-badge
											absolute
											max="99"
											:offset="[-6, -6]"
											:customStyle="{
												background: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)',
												boxShadow: '0 2rpx 8rpx rgba(102, 126, 234, 0.3)',
											}"
											numberType="overflow"
											:value="shoppingCartStore.getBadgeByItemId(item.id)" />
									</view>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
		</view>

		<view class="tabs">
			<up-sticky bgColor="#fff">
				<up-tabs
					:list="tabsList"
					lineWidth="35"
					lineColor="linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)"
					@change="handleTabChange"
					:activeStyle="{
						color: '#ff6b6b',
						fontWeight: '600',
						transform: 'scale(1.05)',
					}"
					:inactiveStyle="{
						color: '#999',
						transform: 'scale(1)',
					}" />
			</up-sticky>
		</view>

		<!-- 左侧分类、右侧菜品 -->
		<view
			class="cate-dish-container"
			:style="{ height: cateDishHeight + 'px' }">
			<!-- 分类列表以及菜品展示区 -->
			<scroll-view
				v-if="cateList.length"
				class="cate-left"
				:scroll-y="true"
				style="flex: 1; padding-bottom: 150rpx">
				<view
					v-for="(item, index) in cateList"
					class="cate-item oneline-hide"
					:class="{ selected: categoryId === item.id }"
					:key="index"
					@click="handleSelectNav(item)">
					{{ item.name }}
				</view>
			</scroll-view>

			<!-- 对应分类菜单下的菜品 -->
			<scroll-view
				class="cate-content"
				:scroll-y="true"
				style="flex: 2.8; padding-bottom: 130rpx">
				<template v-if="dishList?.length">
					<view
						class="dish-item dis-flex flex"
						v-for="(dish, i) in dishList"
						@click="handleDishClick(dish)"
						:key="i">
						<view class="dish-image">
							<up-image
								show-loading
								:src="dish.image"
								width="110px"
								height="110px"
								:radius="8" />
						</view>

						<view class="dish-info">
							<view class="dish-content">
								<view class="dish-name">{{ dish.name }}</view>
								<view
									class="dish-desc-tag"
									v-if="dish.description"
									>{{ dish.description }}</view
								>
							</view>
							<view class="dish-action">
								<view class="dish-price">
									<text class="f-20 f-w">￥</text>
									<text class="f-32 f-w">{{ dish.price }}</text>
								</view>
								<!-- 添加购物车 -->
								<view
									class="dis-flex flex-y-center"
									v-if="!dish.flavors?.length">
									<up-number-box
										:min="0"
										:max="100"
										:showMinus="dish.number! > 0">
										<template #minus>
											<view
												class="minus"
												@click="handleSubCart(dish)">
												<up-icon
													name="minus-circle"
													color="#ff6b6b"
													size="20" />
											</view>
										</template>
										<template
											#input
											v-if="dish.number && dish.number > 0">
											<text
												style="width: 25px; text-align: center"
												class="dish-number"
												>{{ dish.number }}</text
											>
										</template>
										<template #plus>
											<view
												class="plus"
												@click="handleAddCart(dish)">
												<up-icon
													name="plus-circle-fill"
													color="#ff6b6b"
													size="20"></up-icon>
											</view>
										</template>
									</up-number-box>
								</view>
								<!-- 选择规格 -->
								<view
									v-else
									@click.stop="handleDishFlavors(dish)"
									style="position: relative">
									<up-button
										type="primary"
										text="选择规格"
										size="mini"
										shape="circle"
										:customStyle="{
											background: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)',
											borderColor: 'transparent',
											boxShadow: '0 4rpx 12rpx rgba(255, 107, 107, 0.3)',
										}" />

									<up-badge
										absolute
										max="99"
										:offset="[-6, -6]"
										:customStyle="{
											background: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)',
											boxShadow: '0 2rpx 8rpx rgba(102, 126, 234, 0.3)',
										}"
										numberType="overflow"
										:value="shoppingCartStore.getBadgeByItemId(dish.id)" />
								</view>
							</view>
						</view>
					</view>
				</template>

				<!-- 空列表提示 -->
				<empty
					v-else
					style="height: 100%"
					:is-loading="isLoading" />
			</scroll-view>
		</view>

		<!-- 购物车 -->
		<view
			class="shopping-cart"
			:style="[cartAnimation]">
			<up-row
				align="center"
				:custom-style="{ position: 'relative' }">
				<up-col
					span="4"
					@click="handleShowCartPopup">
					<view class="icon">
						<text class="iconfont icon-shopping-cart"></text>
						<up-badge
							absolute
							:offset="[-14, '78%']"
							type="error"
							max="99"
							:value="totalNum"
							color="#fff"
							:customStyle="{
								background: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)',
								boxShadow: '0 2rpx 8rpx rgba(102, 126, 234, 0.3)',
							}"
							shape="horn"></up-badge>
					</view>
					<view class="total-price dis-flex flex-y-center">
						<text class="f-25">￥</text>
						<text class="f-40"
							><up-count-to
								:start-val="0"
								color="#fff"
								:end-val="totalPrice"
								:duration="2000"
								:useEasing="true"
								:decimals="2"></up-count-to
						></text>
					</view>
				</up-col>

				<up-col
					span="8"
					offset="2"
					justify="end">
					<up-button
						type="error"
						text="去下单"
						:customStyle="{
							background: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)',
							borderColor: 'transparent',
							boxShadow: '0 4rpx 12rpx rgba(255, 107, 107, 0.3)',
						}"
						shape="circle"
						:disabled="totalNum <= 0"
						@click="onOrdersSubmit"
						:custom-style="{ 'max-width': '110px' }" />
				</up-col>
			</up-row>
		</view>

		<!-- 购物车弹出层 -->
		<view class="cart-popup">
			<up-popup
				:show="showCartPopup"
				mode="bottom"
				@close="close"
				@open="open"
				:customStyle="{
					'min-height': '400rpx',
					padding: '30rpx 30rpx 80px 30rpx',
				}"
				z-index="10075">
				<view class="cart-wrap h-full dis-flex flex-dir-column">
					<view class="cart-header dis-flex flex-y-center flex-x-between mb-30">
						<view class="f-w">🛒已加购物车商品</view>
						<view
							class="cart-clean dis-flex flex-y-center"
							@click="handleCleanCart">
							<up-icon
								name="trash-fill"
								color="#818181"
								size="15"></up-icon>
							<text
								class="f-22 mr-10"
								style="color: #818181"
								>清空</text
							>
						</view>
					</view>

					<!-- 购物车商品列表，80rpx为cart-header的height+margin-bottom -->
					<scroll-view
						:scroll-y="true"
						style="max-height: 500rpx; flex-grow: 1"
						:style="{ height: 'calc(100% - 80rpx)' }">
						<view class="cart-dish-list">
							<view
								class="cart-dish-item mb-20"
								v-for="(cd, di) in cartList"
								:key="di">
								<view class="cart-dish-image">
									<up-image
										show-loading
										:src="cd.image"
										width="85px"
										height="85px"
										:radius="5" />
								</view>

								<view class="cart-dish-info w-full">
									<view class="dis-flex flex-dir-column">
										<view class="dish-name">{{ cd.name }}</view>
										<view
											v-show="cd.dishFlavor"
											class="dish-desc"
											>{{ cd.dishFlavor }}</view
										>
									</view>

									<view
										class="dish-price-number dis-flex flex-y-center flex-x-between">
										<view class="dish-price">
											<text class="f-24 f-w">￥</text>
											<text class="f-40 f-w">{{ cd.amount }}</text>
										</view>

										<view
											class="number-box"
											style="transform: scale(0.8)">
											<up-number-box
												v-model="cd.number"
												:buttonSize="25"
												:min="0"
												:max="100"
												@change="onChangeStepper($event, cd)" />
										</view>
									</view>
								</view>
							</view>
						</view>
					</scroll-view>
				</view>
			</up-popup>
		</view>

		<DishFlavorModel
			ref="JDishFlavorModel"
			:title="dishFlavorModel.title" />
	</view>
</template>

<script setup lang="ts">
	import { getCurrentInstance } from "vue"
	import { checkLogin } from "@/core/app"
	import CategoryApi, { type CategoryVO } from "@/api/category"
	import DishAPI, { type DishVO } from "@/api/dish"
	import SetmealAPI, { type SetmealVO } from "@/api/setmeal"
	import AiRecommendAPI, { type RecommendRequestDTO } from "@/api/ai-recommend"
	import { ShoppingCart, ShoppingCartDTO } from "@/api/shopping-cart"
	import { CategoryTypeEnum } from "@/enums/CategoryEnum"
	import { onPullDownRefresh, onShow } from "@dcloudio/uni-app"
	import { useShoppingCartStore, useShopStore } from "@/store"
	import { storeToRefs } from "pinia"
	import Empty from "@/components/empty/index.vue"
	import * as OrderConstants from "@/common/constant/order"
	import DishFlavorModel from "./components/DishFlavorModel.vue"

	const shopStore = useShopStore()
	const shoppingCartStore = useShoppingCartStore()
	const { isOperating } = storeToRefs(shopStore)
	const { totalNum, totalPrice } = storeToRefs(shoppingCartStore)
	const instance = getCurrentInstance()
	const proxy = instance?.proxy
	const cateList = ref<CategoryVO[]>([])
	const dishList = ref<DishVO[]>([])
	const swiperList = reactive([
		{
			image:
				"https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fci.xiaohongshu.com%2F433a9ca8-666c-d4c4-5c61-9a86bc8846dd%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fci.xiaohongshu.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1756277045&t=493f09f59ace5d7ac46e4f8047c04426",
		},
		// {
		// 	image:
		// 		"https://static.tujuren.com/tjr_imgs/30107/47297bfdc151ecb7f9ef9508f985e7c4.jpg?x-oss-process=image/resize,h_600,m_lfit,limit_0,image/sharpen,90/format,webp&g=7e939de34aa3b8862a68833577f021ba",
		// },
		// {
		// 	image:
		// 		"https://static.tujuren.com/tjr_imgs/21210/23b7bd43a7bc242a7d88ec09d4041a39.jpg?x-oss-process=image/resize,h_600,m_lfit,limit_0,image/sharpen,90/format,webp&g=7e939de34aa3b8862a68833577f021ba",
		// },
	])
	const tabsList = reactive([{ name: "全部菜品" }, { name: "热门菜品" }, { name: "优惠券" }])
	const isLoading = ref(false)
	// 当前选中分类id
	const categoryId = ref()
	const cartAnimation = reactive({
		transform: "translate(-50%, 0px)",
	})
	const showCartPopup = ref(false)
	const cartList = ref<ShoppingCart[]>([])
	// 动态列表高度
	const cateDishHeight = ref(0)
	const JDishFlavorModel = ref<InstanceType<typeof DishFlavorModel>>()
	const dishFlavorModel = reactive({
		title: "",
	})
	// 是否允许跳转到详情页（防抖用）
	const allowNavigate = ref<boolean>(true)
	// 当前选中的tab索引
	const tabIndex = ref(0)

	// AI推荐相关数据
	const aiInputText = ref("")
	const aiLoading = ref(false)
	const aiRecommendList = ref<any[]>([])

	// AI推荐方法
	const handleAiRecommend = async () => {
		if (!aiInputText.value.trim()) {
			uni.showToast({
				title: "请输入您的喜好描述",
				icon: "none",
			})
			return
		}

		aiLoading.value = true
		try {
			// 调用AI推荐API
			const requestData: RecommendRequestDTO = {
				preference: aiInputText.value,
				shopId: 1, // 使用默认店铺ID
			}

			const response = await AiRecommendAPI.recommend(requestData)
			console.log("AI推荐结果:", response)

			if (response.code === 200 && response.data) {
				aiRecommendList.value = response.data
				uni.showToast({
					title: "推荐成功！",
					icon: "success",
				})
			} else {
				// 如果API调用失败，使用模拟数据
				aiRecommendList.value = getMockRecommendations(aiInputText.value)
				uni.showToast({
					title: "为您推荐了几道美食",
					icon: "success",
				})
			}
		} catch (error) {
			console.error("AI推荐失败:", error)
			// 使用模拟数据作为降级方案
			aiRecommendList.value = getMockRecommendations(aiInputText.value)
			uni.showToast({
				title: "为您推荐了几道美食",
				icon: "success",
			})
		} finally {
			aiLoading.value = false
		}
	}

	// 模拟AI推荐数据（作为降级方案）
	const getMockRecommendations = (preference: string) => {
		const mockData = [
			{
				id: 1,
				name: "麻辣香锅螺蛳粉",
				price: 18.8,
				image:
					"https://img1.baidu.com/it/u=2064546938,1637654395&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=375",
				reason: "根据您的喜好，这道菜香辣过瘾，口感丰富",
			},
			{
				id: 2,
				name: "鸡爪螺蛳粉",
				price: 12.8,
				image:
					"https://img0.baidu.com/it/u=3285117187,2269304491&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=375",
				reason: "经典搭配，鸡爪Q弹，汤汁鲜美",
			},
			{
				id: 3,
				name: "招牌螺蛳粉",
				price: 15.8,
				image:
					"https://img2.baidu.com/it/u=3851687340,1463945213&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=375",
				reason: "店家招牌，口味正宗，值得一试",
			},
		]

		// 根据用户输入简单筛选推荐
		if (preference.includes("辣") || preference.includes("麻")) {
			return mockData.filter(item => item.name.includes("麻辣"))
		} else if (preference.includes("清淡") || preference.includes("不辣")) {
			return mockData.filter(item => !item.name.includes("麻辣"))
		}

		return mockData.slice(0, 3)
	}

	// 添加推荐菜品到购物车
	const addToCart = async (item: any) => {
		// 禁止跳转
		allowNavigate.value = false

		const isContinue = checkLogin()
		if (!isContinue) {
			navToLogin()
			return
		}

		// 将推荐的菜品转换为ShoppingCartDTO格式
		const cartItem: ShoppingCartDTO = {
			name: item.name,
			image: item.image,
			amount: item.price,
			number: 1,
			dishFlavor: "",
			dishId: item.id,
		}

		try {
			await shoppingCartStore.addCart(cartItem)
			uni.showToast({
				title: "已加入购物车",
				icon: "success",
			})

			// 更新菜品数量显示
			updateDishNumber(item.id)
		} catch (error) {
			console.error("添加购物车失败:", error)
			uni.showToast({
				title: "添加失败，请重试",
				icon: "error",
			})
		}
	}

	// 在页面挂载时计算高度
	onMounted(() => {
		// 等待渲染完成后再计算高度
		nextTick(() => {
			// 计算分类、菜单列表高度
			calculateHeight()
		})
	})

	onShow(() => {
		onRefreshPage()
	})

	// 每当店铺营业状态发生改变，重新计算分类、菜单列表高度
	watch(
		() => isOperating,
		() => {
			calculateHeight()
		},
		{ immediate: true }
	)

	watch(
		totalNum,
		newNum => {
			const isCartNotEmpty = newNum > 0
			const animationStyles = {
				// transform: isCartNotEmpty
				// 	? "translateX(-50%)"
				// 	: "translate(-50%, 180rpx)",
				filter: `grayscale(${isCartNotEmpty ? 0 : 1})`,
				// transition: setTimeout(() => 'all 0.3s ease-in-out', 1000)
			}
			// 合并动画样式
			Object.assign(cartAnimation, animationStyles)
			!isCartNotEmpty && setTimeout(() => (showCartPopup.value = false), 500)
		},
		{ immediate: true }
	)
	// 标签切换
	const handleTabChange = (data: { index: number; name: string }) => {
		// console.log("切换到标签:", data.name, "索引:", data.index)
		let tabItem: CategoryVO = {
			id: undefined,
			name: data.name,
		}
		// console.log("切换到标签:", tabItem)
		switch (data.index) {
			case 0:
				tabIndex.value = 0
				// 获取分类列表
				getCategoryAllList()
				getDishByCateId()
				handleSelectNav(tabItem)
				break
			case 1:
				tabIndex.value = 1
				getCategoryHostList()
				getDishByCateId()
				handleSelectNav(tabItem)
				break
			case 2:
				// 跳转到优惠券领取页面
				uni.navigateTo({
					url: '/pages/coupon/coupon-center'
				})
				break
		}
		// 执行相应逻辑
	}

	async function onRefreshPage() {
		try {
			isLoading.value = true
			// 获取分类列表
			const res = await getCategoryAllList()
			if (res.code !== 200) {
				proxy?.$toast(res.msg || "获取分类列表失败")
				isLoading.value = false
				return
			}
			// 根据分类id获取菜品
			await getDishByCateId()

			// 每次页面显示时都查看当前商家是否正在营业中
			await shopStore.getShopStatus()
			// 店铺已打样
			if (!isOperating.value) {
				// TODO: 可以选择执行一些逻辑
				console.info("当前店铺已打样")
			}

			if (!checkLogin()) {
				// 未登录清空购物车
				shoppingCartStore.clearStorageCart().then(() => {
					// 更新菜品列表菜品的数量
					updateDishNumber()
				})
				return
			}

			// 再来一单
			if (uni.getStorageSync(OrderConstants.IS_REPETITION)) {
				showCartPopup.value = true
				setTimeout(() => uni.removeStorageSync(OrderConstants.IS_REPETITION), 0)
			}

			// 获取购物车列表（同步本地数据）
			await getCartList()
		} catch (error) {
			isLoading.value = false
			console.error("刷新页面时出错", error)
		}
	}

	function getCategoryAllList() {
		return new Promise<ResponseData<CategoryVO[]>>((resolve, reject) => {
			CategoryApi.list()
				.then(res => {
					cateList.value = res.data
					cateList.value.unshift({ id: undefined, name: "全部菜品" })
					resolve(res)
				})
				.catch(err => {
					reject(err)
				})
		})
	}
	function getCategoryHostList() {
		return new Promise<ResponseData<CategoryVO[]>>((resolve, reject) => {
			CategoryApi.list()
				.then(res => {
					cateList.value = res.data
					cateList.value.unshift({ id: undefined, name: "热门菜品" })
					resolve(res)
				})
				.catch(err => {
					reject(err)
				})
		})
	}

	//点击菜品进入详情页
	function handleDishClick(dish: DishVO) {
		// 如果不允许跳转，直接返回
		if (!allowNavigate.value) {
			// 重置标志位
			setTimeout(() => {
				allowNavigate.value = true
			}, 100)
			return
		}
		// console.log("点击菜品进入详情页", dish)
		// 将整个dish对象序列化后传递
		const dishParam = encodeURIComponent(JSON.stringify(dish))
		uni.navigateTo({
			url: `/pages/index/components/DishDetail?dish=${dishParam}`,
		})
	}

	async function getDishByCateId() {
		// console.log("tabIndex", tabIndex.value)

		const [dishData, setmealData] = await Promise.all([
			DishAPI.getDishByCateId(categoryId.value, tabIndex.value),
			SetmealAPI.getSetmealCateId(categoryId.value, tabIndex.value),
		])

		const dishes =
			dishData.data?.map(v => ({ ...v, type: CategoryTypeEnum.DISH })) || []
		const setmeals =
			setmealData.data?.map(v => ({ ...v, type: CategoryTypeEnum.SETMEAL })) ||
			[]

		dishList.value = [...dishes, ...setmeals].map(item => ({
			...item,
			number: setDefaultNumber(item),
		})) as DishVO[]
		if (tabIndex.value === 1) {
			dishList.value.sort((a, b) => b.hotSpot - a.hotSpot)
		}
	}

	function setDefaultNumber(data: DishVO | SetmealVO) {
		const cartList = (uni.getStorageSync("cart") || []) as ShoppingCart[]
		if (cartList.length === 0) {
			data.number = 0
			return
		}
		const cartItem = cartList.find(
			v => v.dishId === data.id || v.setmealId === data.id
		)
		if (cartItem) {
			data.number = cartItem.number
		}
	}

	async function getCartList() {
		shoppingCartStore.getCartlist().then(res => {
			cartList.value = res.data || []
			const ids = res.data.map(v => v.dishId || v.setmealId)
			// 更新菜品列表（菜品数量）
			updateDishNumber(ids as number[])
		})
	}

	// 选择菜品口味
	const handleDishFlavors = (dish: DishVO) => {
		// console.log("选择菜品口味", dish)
		dishFlavorModel.title = dish.name || "选择菜品口味"
		JDishFlavorModel.value?.show(dish)
	}

	// 添加商品
	const handleAddCart = async (dish: DishVO) => {
		// console.log("添加商品==>", dish)
		const isContinue = checkLogin()
		if (!isContinue) {
			navToLogin()
			return
		}

		const idKey = dish.type === CategoryTypeEnum.DISH ? "dishId" : "setmealId"

		dish.number = (dish.number || 0) + 1
		await shoppingCartStore.addCart({
			name: dish.name,
			image: dish.image,
			amount: dish.price,
			number: dish.number,
			dishFlavor: "",
			[idKey]: dish.id,
		})
	}

	// 从购物车删除商品
	const handleSubCart = async (data: DishVO) => {
		console.log("删除商品==>", data)

		shoppingCartStore.subCart(data).then(() => {
			// 使用本地存储数据刷新菜品列表
			updateDishNumber(data.id as number)
		})
	}

	// 购物车弹出层商品增加或者减少，发生变化
	const onChangeStepper = (
		{ value }: { value: number },
		item: ShoppingCart
	) => {
		shoppingCartStore
			.updateShoppingCartNumber({
				...item,
				number: value,
			})
			.then(() => {
				const itemKey = item.dishId ? "dishId" : "setmealId"
				// 更新菜品列表数据
				updateDishNumber(item[itemKey] as number)
				if (value === 0) {
					cartList.value = cartList.value.filter(v => v.number! > 0)
					// 更新购物车列表数据
				}
			})
	}

	const handleSelectNav = (item: CategoryVO) => {
		if (item.id === categoryId.value) return
		categoryId.value = item.id
		if (item.name === "全部菜品") {
			tabIndex.value = 0
		} else if (item.name === "热门菜品") {
			tabIndex.value = 1
		} else {
			tabIndex.value = 0
		}

		getDishByCateId()
	}

	// 显示购物车弹出层
	const handleShowCartPopup = () => {
		// 没有商品，不允许打开弹出层
		if (totalNum.value <= 0) {
			return
		}
		showCartPopup.value = !showCartPopup.value
	}

	const open = () => {
		showCartPopup.value = true
		const len = cartList.value.length
		const data = uni.getStorageSync("cart") as ShoppingCart[]
		// 使用缓存数据
		if (data.length !== 0) {
			cartList.value = data
			return
		}

		if (len === 0) {
			// 重新加载购物车数据
			getCartList()
		}
	}

	const close = () => {
		showCartPopup.value = false
	}

	const handleCleanCart = () => {
		uni.showModal({
			title: "友情提示",
			content: "确定要删除该清空购物车吗？",
			showCancel: true,
			success({ confirm }) {
				// 确认删除
				confirm && onClearCart()
			},
		})
	}

	function onClearCart() {
		shoppingCartStore.cleanCart().then(() => {
			// 刷新菜品列表
			getDishByCateId()
			// 关闭购物车弹出层
			showCartPopup.value = false
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
			dishList.value[index].number = cartItem?.number ?? 0
			return
		}

		if (Array.isArray(ids)) {
			// 如果传入的是多个菜品的 ID
			for (const id of ids) {
				const cartItem = c.find(v => v.dishId === id || v.setmealId === id)
				const index = dishList.value.findIndex(v => v.id === id)
				if (index !== -1) {
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

	// 获取页面中其他部分的高度并计算 cate-dish-container 高度
	function calculateHeight() {
		let totalHeight = 0
		const query = uni.createSelectorQuery()

		// 获取 某个元素 部分的高度
		const getElementHeight = (selector: string) => {
			return new Promise<number>(resolve => {
				query
					.select(selector)
					.boundingClientRect(data => {
						if (Array.isArray(data)) {
							resolve(data[0]?.height || 0) // 处理数组情况
						} else {
							resolve(data?.height || 0) // 处理对象情况
						}
					})
					.exec()
			})
		}

		// 左侧分类、菜品列表高度
		Promise.all([
			getElementHeight(".logo-header"),
			getElementHeight(".swiper"),
			getElementHeight(".notice"),
			getElementHeight(".tabs"),
		]).then(heights => {
			totalHeight = heights.reduce((sum, height) => sum + height, 0)

			// 计算剩余高度
			const windowHeight = uni.getSystemInfoSync().windowHeight
			cateDishHeight.value = windowHeight - totalHeight - 15 // 15px为1个 margin-[top]: 15rpx
		})
	}

	// 创建订单，订单确认
	function onOrdersSubmit() {
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

	/**
	 * 下拉刷新
	 */
	onPullDownRefresh(() => {
		// 重新获取菜品数据
		onRefreshPage().finally(() => {
			uni.stopPullDownRefresh()
		})
	})
</script>

<style lang="scss">
	:deep(.order) {
		.u-tag--error,
		.u-tag--info {
			height: 15px !important;
		}

		swiper {
			padding: 0 30rpx;
		}

		.u-sticky {
			background-color: transparent !important;
		}

		.dish-flavor-model {
			.u-modal,
			.u-popup__content {
				overflow: inherit !important;
			}

			.u-modal__title {
				color: black !important;
				padding: 50rpx 0 20rpx !important;
			}

			.u-modal__content {
				display: block !important;
			}

			.u-button--mini {
				height: 56rpx !important;
				padding: 0 36rpx !important;

				text {
					font-size: 22rpx !important;
				}
			}
		}
	}
</style>

<style lang="scss" scoped>
	.cart-empty {
		filter: grayscale(1);
	}

	.logo-header {
		padding: 40rpx 30rpx;
		background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%);
		box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.25);
		position: relative;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: space-between;

		&::before {
			content: '';
			position: absolute;
			top: -50%;
			right: -20%;
			width: 400rpx;
			height: 400rpx;
			background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
			border-radius: 50%;
		}

		.logo {
			display: flex;
			align-items: center;

			.custom-logo {
				display: flex;
				align-items: center;

				.logo-text {
					display: flex;
					flex-direction: column;
					align-items: flex-start;

					.logo-main {
						font-size: 42rpx;
						font-weight: 800;
						color: #ffffff;
						line-height: 1.3;
						letter-spacing: 3rpx;
						text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
					}

					.logo-sub {
						font-size: 20rpx;
						color: rgba(255, 255, 255, 0.9);
						font-weight: 500;
						letter-spacing: 4rpx;
						margin-top: 6rpx;
					}
				}
			}
		}

		.store_info {
			display: flex;
			flex-direction: column;
			gap: 16rpx;

			.store-header {
				display: flex;
				align-items: center;
				gap: 12rpx;

				.store_name {
					color: #ffffff;
					font-weight: 700;
					font-size: 32rpx;
					text-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.2);
				}
			}

			.store-bottom {
				display: flex;
				flex-direction: column;
				gap: 8rpx;

				.info-item {
					display: flex;
					align-items: center;
					gap: 8rpx;
					font-size: 24rpx;
					color: rgba(255, 255, 255, 0.9);
				}
			}
		}
	}

	.swiper {
		margin: 25rpx 30rpx;
		border-radius: 28rpx;
		overflow: hidden;
		box-shadow: 0 12rpx 32rpx rgba(255, 107, 107, 0.15);
		border: 3rpx solid rgba(255, 255, 255, 0.8);
	}

	.notice {
		padding: 0 30rpx;
		margin: 0 30rpx 25rpx 30rpx;

		:deep(.u-notice-bar) {
			background: linear-gradient(135deg, #fff5f0 0%, #fff 100%);
			border-radius: 16rpx;
			border: 2rpx solid rgba(255, 107, 107, 0.2);
			padding: 16rpx 24rpx;
		}
	}

	.tabs {
		padding: 0 30rpx;
		background: #ffffff;
		border-radius: 24rpx 24rpx 0 0;
		box-shadow: 0 -4rpx 24rpx rgba(255, 107, 107, 0.08);
	}

	.dish-price {
		color: #ff6b6b;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial;
	}

	// 菜品容器
	.cate-dish-container {
		display: flex;
		margin-top: 0;
		padding: 25rpx 30rpx;
		background: linear-gradient(180deg, #fff8f5 0%, #fff 100%);
		min-height: calc(100vh - 400rpx);

		// 左侧分类菜单
		.cate-left {
			flex: 1.2;
			text-align: center;
			background: #ffffff;
			padding: 25rpx 0;
			max-width: 180rpx;
			border-radius: 20rpx 0 0 20rpx;
			box-shadow: 0 4rpx 16rpx rgba(255, 107, 107, 0.08);

			.cate-item {
				$h: 88rpx;
				height: $h;
				line-height: $h;
				font-size: 28rpx;
				color: #666;
				padding: 0 15rpx;
				transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
				position: relative;
				margin: 8rpx 0;

				&.selected {
					background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%);
					color: #ffffff;
					font-weight: 700;
					position: relative;
					border-radius: 0 44rpx 44rpx 0;
					margin: 8rpx 15rpx;
					padding: 0 22rpx;
					box-shadow: 0 6rpx 16rpx rgba(255, 107, 107, 0.35);

					&::before {
						content: '';
						position: absolute;
						left: 0;
						top: 50%;
						transform: translateY(-50%);
						width: 6rpx;
						height: 40%;
						background: rgba(255, 255, 255, 0.8);
						border-radius: 0 3rpx 3rpx 0;
					}
				}
			}
		}

		// 右侧对应分类菜品
		.cate-content {
			flex: 4;
			margin-left: 20rpx;
			padding: 25rpx;
			background: #ffffff;
			border-radius: 0 20rpx 20rpx 0;
			box-shadow: 0 4rpx 16rpx rgba(255, 107, 107, 0.08);
		}
	}

	.dish-item {
		margin-bottom: 30rpx;
		padding: 24rpx;
		background: #ffffff;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 16rpx rgba(255, 107, 107, 0.08);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		border: 2rpx solid transparent;
		display: flex;
		gap: 20rpx;

		&:active {
			transform: translateY(-4rpx);
			box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.15);
			border-color: rgba(255, 107, 107, 0.2);
		}

		.dish-image {
			flex-shrink: 0;
			border-radius: 12rpx;
			overflow: hidden;
		}

		.dish-info {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			gap: 12rpx;

			.dish-content {
				.dish-name {
					font-size: 30rpx;
					color: #333;
					font-weight: 700;
					margin-bottom: 8rpx;
					line-height: 1.4;
				}

				.dish-desc-tag {
					font-size: 24rpx;
					color: #999;
					line-height: 1.6;
				}
			}

			.dish-action {
				display: flex;
				align-items: center;
				justify-content: space-between;

				.dish-number {
					margin: 0 18rpx;
					max-width: 80rpx;
				}
			}
		}
	}

	// 购物车
	.shopping-cart {
		position: fixed;
		z-index: 10076;
		bottom: 35rpx;
		left: 50%;
		transform: translateX(-50%);
		width: 90%;
		min-height: 110rpx;
		padding: 18rpx 24rpx;
		background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%);
		border-radius: 55rpx;
		box-shadow: 0 12rpx 32rpx rgba(255, 107, 107, 0.35);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		border: 3rpx solid rgba(255, 255, 255, 0.3);

		.icon {
			margin-right: 18rpx;

			& text:first-child {
				font-size: 130rpx;
				position: absolute;
				top: -65%;
				left: 24rpx;
				filter: drop-shadow(0 6rpx 12rpx rgba(0, 0, 0, 0.25));
			}
		}

		.total-price {
			color: #fff;
			margin-left: 170rpx;
			font-weight: 700;
			text-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.2);
		}
	}

	// 购物车弹出层
	.cart-header {
		flex: 1;
		max-height: 50rpx;
		height: auto;
		padding-bottom: 24rpx;
		border-bottom: 3rpx solid rgba(255, 107, 107, 0.1);
	}

	.cart-dish-item {
		display: flex;
		max-height: 85px;
		padding: 24rpx;
		background: #ffffff;
		border-radius: 16rpx;
		margin-bottom: 18rpx;
		box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.08);
		border: 2rpx solid rgba(255, 107, 107, 0.05);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

		&:active {
			transform: translateY(-2rpx);
			box-shadow: 0 6rpx 16rpx rgba(255, 107, 107, 0.12);
		}

		.cart-dish-image {
			margin-right: 24rpx;
			border-radius: 12rpx;
			overflow: hidden;
		}

		.cart-dish-info {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			flex: 1;

			.dish-name {
				font-weight: 700;
				font-size: 30rpx;
				margin-bottom: 10rpx;
				color: #333;
			}

			.dish-desc {
				font-size: 24rpx;
				color: #999;
			}
		}
	}

	// AI推荐模块样式
	.ai-recommend-section {
		margin: 25rpx 30rpx;
		padding: 28rpx;
		background: linear-gradient(135deg, #fff8f5 0%, #ffffff 100%);
		border-radius: 28rpx;
		box-shadow: 0 6rpx 20rpx rgba(255, 107, 107, 0.1);
		border: 2rpx solid rgba(255, 107, 107, 0.15);

		.ai-input-container {
			display: flex;
			align-items: center;
			margin-bottom: 28rpx;
			gap: 18rpx;

			.input-wrapper {
				flex: 1;
				display: flex;
				align-items: center;
				background: #ffffff;
				border-radius: 35rpx;
				padding: 0 28rpx;
				border: 2rpx solid rgba(255, 107, 107, 0.15);
				box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.08);
				transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

				&:focus-within {
					border-color: #ff6b6b;
					box-shadow: 0 6rpx 16rpx rgba(255, 107, 107, 0.2);
				}

				.input-icon {
					font-size: 36rpx;
					margin-right: 18rpx;
					background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%);
					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
					background-clip: text;
				}

				.ai-input {
					flex: 1;
					height: 88rpx;
					font-size: 28rpx;
					color: #333;
					background: transparent;
					border: none;
					outline: none;

					&::placeholder {
						color: #999;
						font-size: 26rpx;
					}
				}
			}

			.recommend-btn {
				height: 88rpx;
				padding: 0 40rpx;
				background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%);
				color: white;
				border: none;
				border-radius: 35rpx;
				font-size: 30rpx;
				font-weight: 700;
				cursor: pointer;
				transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
				box-shadow: 0 6rpx 16rpx rgba(255, 107, 107, 0.3);

				&:active {
					transform: scale(0.95);
					box-shadow: 0 4rpx 10rpx rgba(255, 107, 107, 0.25);
				}

				&.loading {
					background: #ccc;
					cursor: not-allowed;
				}

				&:disabled {
					background: #ccc;
					cursor: not-allowed;
				}
			}
		}

		.ai-recommend-results {
			.results-header {
				margin-bottom: 24rpx;

				.results-title {
					font-size: 30rpx;
					font-weight: 700;
					color: #333;
					padding-left: 12rpx;
					border-left: 8rpx solid #ff6b6b;
					line-height: 1.2;
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

						.recommend-image {
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
								margin-bottom: 10rpx;
								overflow: hidden;
								text-overflow: ellipsis;
								white-space: nowrap;
							}

							.recommend-reason {
								display: block;
								font-size: 24rpx;
								color: #999;
								margin-bottom: 18rpx;
								line-height: 1.6;
								white-space: normal;
								word-wrap: break-word;
							}

							.price-action {
								display: flex;
								justify-content: space-between;
								align-items: center;

								.price {
									font-size: 32rpx;
									font-weight: 700;
									background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%);
									-webkit-background-clip: text;
									-webkit-text-fill-color: transparent;
									background-clip: text;
								}
							}
						}
					}
				}
			}
		}
	}
</style>
