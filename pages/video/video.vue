<template>
	<view class="videoList">
		<!-- 顶部导航栏 -->
		<view class="navbarSorll">
			<scroll-view scroll-x="true" :scroll-into-view="scrollLeft" scroll-left="0" ref="scrollList">
				<view
					:class="{ active: item.active }"
					v-for="(item, index) in videoGroupList"
					:key="index"
					:id="'text' + index"
					:ref="'text' + index"
					@click="setVideoGroupID(item.id, index)"
				>
					<text>{{ item.name }}</text>
				</view>
			</scroll-view>
		</view>

		<view class="list" @touchmove.stop.prevent @touchstart="start" @touchend="end">
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
				<uni-grid :column="2" :show-border="false" :square="false">
					<uni-grid-item v-for="(item, index) in videoList" :key="index">
						<view class="warp" v-if="item.type == 1" @click="openVideoDatails(item.data.vid)">
							<view class="image">
								<image :src="item.data.coverUrl" :alt="item.data.title" ref="imageError" mode="aspectFill" />
								<image :src="item.data.creator.avatarUrl" :alt="item.data.creator.nickname" mode="aspectFill" />

								<text>{{ item.data.durationms | formatMilliseconds }}</text>
							</view>
							<view class="description">
								<text class="text">{{ item.data.title }}</text>
							</view>
							<view class="items">
								<view class="p">
									<i class=" iconfont iconicon--">
										<text>{{ item.data.playTime | retainDoubleDigit }}</text>
									</i>
								</view>
								<view class="p">
									<i class=" iconfont icondianzan">
										<text>{{ item.data.praisedCount }}</text>
									</i>
								</view>
							</view>
						</view>
						<view class="warp" v-else @click="openVideoDatails(item.data.id)">
							<view class="image"><image :src="item.data.coverUrl" :alt="item.data.name" mode="aspectFill" /></view>
							<view class="description">
								<text class="text">{{ item.data.name }}</text>
							</view>

							<view class="items">
								<view class="p">
									<i class=" iconfont iconicon--">
										<text>{{ item.data.playCount | retainDoubleDigit }}</text>
									</i>
								</view>
								<view class="p">
									<i class=" iconfont iconshoucang">
										<text>{{ item.data.likeCount }}</text>
									</i>
								</view>
							</view>
						</view>
					</uni-grid-item>
				</uni-grid>
			</hr-pull-load>
		</view>

		<!-- 播放区 -->
		<music-playbar v-show="isShow"></music-playbar>
	</view>
</template>

<script>
import '@/static/less/video.less';
import musicPlaybar from '@/components/musicPlayBar/musicPlayBar.vue';
export default {
	components: { musicPlaybar },
	data() {
		return {
			scrollLeft: '', //跳转标签
			videoGroupList: {}, //分类标题
			videoGroupId: '', //标题id
			bottomTips: '', //上拉状态标签
			videoList: [], //视频列表
			cookie: '',
			page: 1,
			videoId: '', //视频id
			videoType: 'video', //
			startData: {
				clientX: 0,
				clientY: 0
			}
		};
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
	filters: {
		//拦截器
		retainDoubleDigit: function(data) {
			// 将数据转万
			if (data > 100000000) {
				return (data / 100000000).toFixed(2) + '亿';
			} else {
				return (data / 10000).toFixed(2) + '万';
			}
		},
		formatMilliseconds: function(value) {
			var second = parseInt(value) / 1000; // second
			var minute = 0; // minute
			var hour = 0; // hour
			if (second > 60) {
				minute = parseInt(second / 60);
				second = parseInt(second % 60);
				if (minute > 60) {
					hour = parseInt(minute / 60);
					minute = parseInt(minute % 60);
				}
			}
			var result;
			if (second >= 10) {
				result = '' + parseInt(second);
			} else {
				result = '' + '0' + parseInt(second);
			}
			if (minute >= 10) {
				result = '' + parseInt(minute) + ':' + result;
			} else {
				result = '' + '0' + parseInt(minute) + ':' + result;
			}
			if (hour >= 10) {
				result = '' + parseInt(hour) + ':' + result;
			} else {
				if (hour > 0) {
					result = '' + '0' + parseInt(hour) + ':' + result;
				}
			}
			return result;
		}
	},
	methods: {
		getVideoGroupList: function() {
			let that = this;
			uni.getStorage({
				key: 'cookie',
				success: cookieRes => {
					that.cookie = cookieRes.data;
					uni.request({
						url: 'https://wx.3dcw.cn/video/category/list',
						data: {
							cookie: cookieRes.data
						},
						success: res => {
							that.videoGroupList = res.data.data;
							that.videoGroupId = res.data.data[0].id;
							that.videoGroupList.forEach(item => {
								item['active'] = false;
							});
							that.videoGroupList[0].active = true;
							that.getVideoList();
						},
						fail: err => {
							console.log(err);
						}
					});
				},
				fail: errCookie => {
					console.log(errCookie);
				}
			});
		},
		getVideoList: function() {
			let that = this;
			uni.showLoading({
				mask: true,
				title: '加载中...'
			});
			uni.request({
				url: 'https://wx.3dcw.cn/video/group',
				data: {
					id: that.videoGroupId,
					cookie: that.cookie
				},
				success: res => {
					that.videoList = res.data.datas;
					uni.hideLoading();
				},
				fail: err => {
					console.log(err);
					uni.hideLoading();
				}
			});
		},
		loadMore: function() {
			this.bottomTips = 'loading';
			this.getExampleData();
		},
		getExampleData: function() {
			let params = {},
				that = this;
			this.page++;
			params['id'] = this.videoGroupId;
			params['cookie'] = this.cookie;
			params['offset'] = (this.page - 1) * 21;
			params['t'] = Date.parse(new Date());

			uni.request({
				url: 'https://wx.3dcw.cn/video/group',
				data: params,
				success: function(res) {
					let temporary = that.videoList;
					let playlists = res.data.datas;
					that.videoList = [...temporary, ...playlists];
					that.bottomTips = '';
				},
				fail: function(err) {
					console.log(err);
					that.$refs.hrPullLoad.reSet();
					that.bottomTips = '';
				}
			});
		},
		setVideoGroupID: function(id, index) {
			this.videoGroupId = id;
			this.videoGroupList.forEach(item => {
				item['active'] = false;
			});
			this.videoGroupList[index].active = true;
			this.videoList = {};
			if (id === 1000) {
				this.videoType = 'mv';
			} else {
				this.videoType = 'video';
			}
			this.getVideoList();
		},
		openVideoDatails: function(id) {
			let that = this;
			uni.getStorage({
				key: 'profile',
				success(res) {
					uni.navigateTo({
						url: '/pages/videoDetails/videoDetails',
						success: function(res) {
							res.eventChannel.emit('videoId', {
								videoId: id,
								videoType: that.videoType
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

			if (subX > 100) {//原本50太短了，容易误触
				console.log('右滑');
				let i = 0;
				while (i < this.videoGroupList.length) {
					if (this.videoGroupList[i].active && i <= this.videoGroupList.length - 1 && i - 1 >= 0) {
						this.videoGroupList[i].active = false;
						this.videoGroupList[i - 1].active = true;
						this.$nextTick(function() {
							this.scrollLeft = 'text' + (i - 1);
						});
						this.scrollLeft = '';
						this.setVideoGroupID(this.videoGroupList[i - 1].id, i - 1);
						break;
					}
					i++;
				}
			} else if (subX < -100) {
				console.log('左滑');
				let i = 0;
				while (i < this.videoGroupList.length) {
					if (this.videoGroupList[i].active && i <= this.videoGroupList.length - 1 && i + 1 <= this.videoGroupList.length - 1) {
						this.videoGroupList[i].active = false;
						this.videoGroupList[i + 1].active = true;
						this.$nextTick(function() {
							this.scrollLeft = 'text' + (i + 1);
						});
						this.scrollLeft = '';
						this.setVideoGroupID(this.videoGroupList[i + 1].id, i + 1);
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
		this.getVideoGroupList();
	},
	onShow() {
		if (!this.$store.getters.getplayMessage) {
			this.$store.commit('setplayMessage', true);
			this.$store.commit('setisPlay', true);
			this.playAudio();
		}
	}
};
</script>
