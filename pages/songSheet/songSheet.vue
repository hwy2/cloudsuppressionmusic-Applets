<template>
	<view class="songSheet">
		<!-- 顶部导航栏 -->
		<view class="navbarSorll">
			<scroll-view scroll-x="true" :scroll-into-view="scrollLeft" scroll-left="0">
				<view :class="{ active: item.activity }" v-for="(item, index) in categoryHot" :key="index" :id="'text' + index" @click="gethighquality(index, item.name)">
					<text>{{ item.name }}</text>
				</view>
			</scroll-view>
			<view class="more"><i class="iconfont icongengduo3" @click="openPopup()"></i></view>
		</view>

		<!-- 内容区 -->
		<view class="sheet" @touchmove.stop.prevent @touchstart="start" @touchend="end">
			<hr-pull-load
				@refresh="refresh"
				@loadMore="loadMore"
				:height="-1"
				:pullHeight="50"
				:maxHeight="100"
				:lowerThreshold="200"
				:bottomTips="bottomTips"
				:isAllowPull="false"
				:isTab="false"
				ref="hrPullLoad"
			>
				<uni-grid :column="3" :show-border="false" :square="false">
					<uni-grid-item v-for="(item, index) in highqualityList" :key="index">
						<view class="warp">
							<img :src="item.coverImgUrl" mode="aspectFit" @click="sheetDetails(item.id)" />
							<view class="playVolume">
								<i class="iconfont iconicon--">{{ item.playCount | retainDoubleDigit }}</i>
							</view>
							<text>{{ item.name }}</text>
						</view>
					</uni-grid-item>
				</uni-grid>
			</hr-pull-load>
		</view>
		<!-- 播放区 -->
		<music-playbar v-show="isShow"></music-playbar>

		<!-- 抽屉 -->
		<uni-drawer :visible="true" :mask="true" :maskClick="true" mode="right" ref="draw" :width="260">
			<view class="categories-warp">
				<scroll-view class="bigcategories" scroll-y="false" scroll-left="120">
					<view class="scroll-view-big" v-for="(item, index) in categorieList" :key="index">
						<text class="bigText">{{ item.name }}</text>
						<scroll-view class="smallcategories" scroll-y="false" scroll-left="120">
							<view class="scroll-view-small" v-for="(subs, indexs) in item.sub" :key="indexs">
								<text @click="subSelect(subs.name)">{{ subs.name }}</text>
							</view>
						</scroll-view>
					</view>
				</scroll-view>
			</view>
		</uni-drawer>
	</view>
</template>

<script>
import '@/static/less/songSheet.less';
import sPullScroll from '@/components/s-pull-scroll/index.vue';
import uniGrid from '@/components/uni-grid/uni-grid.vue';
import uniGridItem from '@/components/uni-grid-item/uni-grid-item.vue';
import hrPullLoad from '@/components/hr-pull-load/hr-pull-load.vue';
import musicPlaybar from '@/components/musicPlayBar/musicPlayBar.vue';
import uniDrawer from '@/components/uni-drawer/uni-drawer.vue';
export default {
	components: {
		sPullScroll,
		uniGrid,
		uniGridItem,
		hrPullLoad,
		musicPlaybar,
		uniDrawer
	},
	data() {
		return {
			categoryHot: [], //热门标签
			highqualityList: [], //歌单列表
			category: '', //标签
			songListId: '', //歌单ID
			categorieList: [], //标签列表
			page: 1, //页码
			songSheetType: '', //歌单类别
			navbarWidth: '100%', //歌单类别导航长度
			bottomTips: '',
			scrollLeft: '',
			startData: {
				//滑动偏移量
				clientX: 0,
				clientY: 0
			}
		};
	},
	onLoad(options) {
		const eventChannel = this.getOpenerEventChannel();
		let that = this;
		eventChannel.once('songSheet', function(params) {
			that.songSheetType = params.songSheetType;
		});
	},
	// onUnload() {
	// 	this.eventChannel.off('songSheet');
	// },
	filters: {
		//拦截器
		retainDoubleDigit: function(data) {
			// 将数据转万
			if (data > 100000000) {
				return (data / 100000000).toFixed(2) + '亿';
			} else {
				return (data / 10000).toFixed(2) + '万';
			}
		}
	},
	computed: {
		isShow: {
			//播放状态
			get() {
				return this.$store.state.isShow;
			},
			set(v) {
				// 使用vuex中的mutations中定义好的方法来改变
				this.$store.commit('setisShow', v);
			}
		}
	},
	methods: {
		getcategoryHot: function() {
			uni.showLoading({
				title: '加载中...',
				mask: true
			});
			let that = this;
			uni.request({
				url: 'https://wx.3dcw.cn/playlist/hot',
				method: 'GET',
				success: function(res) {
					that.categoryHot = res.data.tags;
					//添加推荐标签
					let arr2 = {};
					arr2['activity'] = false;
					arr2['name'] = '官方';
					that.categoryHot.unshift(arr2);
					let arr = {};
					arr['activity'] = false;
					arr['name'] = '推荐';
					that.categoryHot.unshift(arr);
					that.navbarWidth = 22 * (that.categoryHot.length + 1) + '%';

					if (that.songSheetType !== '') {
						that.categoryHot[0].activity = false;
						that.categoryHot.forEach((item, index) => {
							if (item.name === that.songSheetType) {
								item.activity = true;
								that.gethighquality(index, that.songSheetType);
							}
						});
					} else {
						that.gethighquality(0, '');
					}
				}
			});
		},
		gethighquality: function(index, category) {
			uni.showLoading({
				mask: true,
				title: '加载中...'
			});
			this.highqualityList = [];
			this.page = 1; //重新初始化
			//获取精品歌单
			this.categoryHot.forEach(function(obj) {
				obj.activity = false;
			});
			this.categoryHot[index].activity = true;
			this.category = category;
			let params = {},
				that = this;
			params['limit'] = 21;
			if (category != '' && category != '推荐') {
				params['cat'] = category;
			}
			uni.request({
				url: 'https://wx.3dcw.cn/top/playlist',
				method: 'GET',
				data: params,
				success: function(res) {
					that.highqualityList = res.data.playlists;
					uni.hideLoading();
				},
				fail() {
					uni.hideLoading();
				}
			});
		},
		//自定义上拉加载更多
		loadMore: function() {
			this.bottomTips = 'loading';
			this.getExampleData();
		},
		getcategory: function() {
			let that = this;
			uni.request({
				url: 'https://wx.3dcw.cn/playlist/catlist',
				method: 'GET',
				data: {
					t: Date.parse(new Date())
				},
				success: function(res) {
					// let "语种","风格","场景","情感","主题"
					let languages = [];
					let style = [];
					let scene = [];
					let emotion = [];
					let themes = [];

					//小类
					res.data.sub.forEach(item => {
						var arr = {};
						switch (item.category) {
							case 0:
								arr['name'] = item.name;
								languages.push(arr);
								break;
							case 1:
								arr['name'] = item.name;
								style.push(arr);
								break;
							case 2:
								arr['name'] = item.name;
								scene.push(arr);
								break;
							case 3:
								arr['name'] = item.name;
								emotion.push(arr);
								break;
							case 4:
								arr['name'] = item.name;
								themes.push(arr);
								break;
						}
					});
					//大类
					for (let a = 0; a < 5; a++) {
						var arr = [];
						switch (a) {
							case 0:
								arr = { name: '语种', sub: languages };
								that.categorieList.push(arr);
								break;
							case 1:
								arr = { name: '风格', sub: style };
								that.categorieList.push(arr);
								break;
							case 2:
								arr = { name: '场景', sub: scene };
								that.categorieList.push(arr);
								break;
							case 3:
								arr = { name: '情感', sub: emotion };
								that.categorieList.push(arr);
								break;
							case 4:
								arr = { name: '主题', sub: themes };
								that.categorieList.push(arr);
								break;
						}
					}
				},
				fail: function(err) {
					console.log(err);
				}
			});
		},
		getExampleData: function() {
			let params = {},
				that = this;
			this.page++;
			// let last = this.highqualityList.pop();
			params['limit'] = 21;
			if (this.category != '' && this.category != '推荐') {
				params['cat'] = this.category;
			}
			params['offset'] = (this.page - 1) * 21;
			params['t'] = Date.parse(new Date());

			uni.request({
				url: 'https://wx.3dcw.cn/top/playlist',
				method: 'GET',
				data: params,
				success: function(res) {
					let temporary = that.highqualityList;
					let playlists = res.data.playlists;
					that.highqualityList = [...temporary, ...playlists];
					that.bottomTips = '';
					if (!res.data.more) {
						that.bottomTips = 'nomore'; // 若数据已全部获取完毕
					}
				},
				fail: function(err) {
					console.log(err);
					that.$refs.hrPullLoad.reSet();
					that.bottomTips = '';
				}
			});
		},
		openPopup: function() {
			this.$refs.draw.open();
		},
		closePopup: function() {
			this.$refs.draw.close();
		},
		subSelect: function(name) {
			uni.showLoading({
				mask: true,
				title: '加载中...'
			});
			let checkTag = 0,
				i = 0;
			//检查已有标签是否有当前选择的标签
			while (i < this.categoryHot.length) {
				if (this.categoryHot[i].name === name) {
					checkTag = i;
					break;
				}
				i++;
			}

			if (!checkTag) {
				//添加标签
				if (this.categoryHot[0].name === '推荐') {
					let arr2 = {};
					arr2['activity'] = true;
					arr2['name'] = name;
					this.categoryHot[0].activity = false;
					this.categoryHot.unshift(arr2);
				} else {
					this.categoryHot[0].name = name;
				}
				this.$nextTick(function() {
					this.scrollLeft = 'text' + checkTag;
				});
				this.scrollLeft = '';
			} else {
				this.$nextTick(function() {
					this.scrollLeft = 'text' + checkTag;
					console.log(this.scrollLeft);
				});
				this.scrollLeft = '';
			}

			this.page == 1;
			this.gethighquality(checkTag, name);
			this.closePopup();
		},
		sheetDetails: function(sheetID) {
			console.log(sheetID);

			uni.getStorage({
				key: 'profile',
				success(res) {
					uni.navigateTo({
						url: '/pages/sheetDetails/sheetDetails',
						success: function(res) {
							res.eventChannel.emit('sheetDetails', {
								songListId: sheetID
							});
						},
						animationType: 'pop-in',
						animationDuration: 200
					});
				},
				fail(err) {
					console.log(err);

					uni.showModal({
						title: '',
						content: '请登录',
						success: function(res) {
							if (res.confirm) {
								uni.navigateTo({
									url: '/pages/login/login',
									animationType: 'pop-in',
									animationDuration: 200
								});
							}
						}
					});
				}
			});
		},
		start(e) {
			this.startData.clientX = e.changedTouches[0].clientX;
			this.startData.clientY = e.changedTouches[0].clientY;
		},
		end: function(e) {
			// console.log(e)
			const subX = e.changedTouches[0].clientX - this.startData.clientX;
			const subY = e.changedTouches[0].clientY - this.startData.clientY;
			if (subX > 100) {
				console.log('右滑');
				let i = 0;
				while (i < this.categoryHot.length) {
					if (this.categoryHot[i].activity && i <= this.categoryHot.length - 1 && i - 1 >= 0) {
						this.categoryHot[i].activity = false;
						this.categoryHot[i - 1].activity = true;
						this.$nextTick(function() {
							this.scrollLeft = 'text' + (i - 1);
						});
						this.scrollLeft = '';
						this.gethighquality(i - 1, this.categoryHot[i - 1].name);
						break;
					}
					i++;
				}
			} else if (subX < -100) {
				console.log('左滑');
				let i = 0;
				while (i < this.categoryHot.length) {
					if (this.categoryHot[i].activity && i <= this.categoryHot.length - 1 && i + 1 <= this.categoryHot.length - 1) {
						this.categoryHot[i].activity = false;
						this.categoryHot[i + 1].activity = true;
						this.$nextTick(function() {
							this.scrollLeft = 'text' + (i + 1);
						});
						this.scrollLeft = '';
						this.gethighquality(i + 1, this.categoryHot[i + 1].name);
						break;
					}
					i++;
				}
			} else {
				console.log('无效');
			}
		}
	},
	created() {
		this.getcategoryHot();
		this.getcategory();
	}
};
</script>

