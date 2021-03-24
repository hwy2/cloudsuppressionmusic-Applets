<template>
	<view class="videoDetails" :style="{ height: pageHeight }" :class="isDark ? 'dark' : ''">
		<view class="videoMain">
			<view class="videoPlay">
				<video
					id="myVideo"
					preload="preload"
					controls="controls"
					:poster="videoDetails.coverUrl"
					autoplay="autoplay"
					x5-video-player-type="h5"
					x5-video-player-fullscreen="true"
					x5-video-orientation="portraint"
					:src="videoUrl"
					object-fit="contain"
				>
					<!-- 					<source :src="videoUrl" type="video/mp4" /> -->
				</video>
			</view>
			<view class="videosub">
				<view class="levelNavigation">
					<scroll-view scroll-x="true" :scroll-into-view="scrollLeft" scroll-left="0">
						<view @click="switchNavigation('简介')" :class="showComments ? 'navigation' : 'navigation active'"><text>简介</text></view>

						<view @click="switchNavigation('评论')" :class="showComments ? 'navigation active' : 'navigation'"><text>评论</text></view>
					</scroll-view>
				</view>
				<view class="substance">
					<view class="briefIntroduction" v-if="!showComments">
						<view class="creator">
							<image :src="videoDetails.creator.avatarUrl || videoDetails.artists[0].img1v1Url" :alt="videoDetails.creator.nickname" mode="aspectFit" />
							<text>{{ videoDetails.creator.nickname || videoDetails.artists[0].name }}</text>
						</view>
						<view class="videoName">
							<text>{{ videoDetails.title || videoDetails.name }}</text>
						</view>
						<view class="likePlaying clearfix">
							<view class="p">
								<i class=" iconfont iconicon--">
									<text v-if="videoDetails.playTime">{{ videoDetails.playTime | retainDoubleDigit }}</text>
									<text v-else>{{ videoDetails.playCount | retainDoubleDigit }}</text>
								</i>
							</view>
							<view class="p">
								<i class=" iconfont icondianzan">
									<text>{{ videoDetails.praisedCount || videoDetails.subCount }}</text>
								</i>
							</view>
						</view>

						<view class="related">
							<view class="related-title"><text>相关视频</text></view>

							<scroll-view scroll-x="true" :scroll-into-view="scrollLeft" scroll-left="0">
								<view v-for="(item, index) in relatedVideo" :key="index" @click="openVideoDatails(item.vid)" class="silde">
									<view class="left"><image :src="item.coverUrl" :alt="item.title" mode="aspectFit" /></view>
									<view class="right">
										<text>{{ item.title }}</text>
									</view>
								</view>
							</scroll-view>
						</view>
					</view>
					<view class="discuss" v-if="showComments">
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
							<scroll-view scroll-x="true" :scroll-into-view="scrollLeft" scroll-left="0">
								<view v-for="(item, index) in commentHot" :key="index" class="scroll-item">
									<view class="top">
										<view class="left">
											<image :src="item.user.avatarUrl" :alt="item.user.nickname" mode="aspectFit" />
											<!-- <image v-if="item.pendantData" :src="item.pendantData.imageUrl" mode="aspectFit" /> -->
										</view>
										<view class="center">
											<text>{{ item.user.nickname }}</text>
											<text>{{ item.time | timeTransformation }}</text>
										</view>
										<view class="right">
											<i class=" iconfont icondianzan">
												<text>{{ item.likedCount }}</text>
											</i>
										</view>
									</view>
									<view class="contentss">
										<text>{{ item.content }}</text>
									</view>
								</view>
							</scroll-view>
						</hr-pull-load>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import '@/static/less/videoDetails.less';

export default {
	data() {
		return {
			videoId: '', //视频ID
			videoType: '', //视频类别
			cookie: '',
			videoDetails: '', //视频详情
			videoUrl: '', //视频url
			commentHot: [], //视频评论
			showComments: false, //显示评论
			page: 1, //页码
			relatedVideo: [], //相关视频
			bottomTips: '',
			pageHeight: '100vh',
			videoContext: '' //视频实例
		};
	},
	onReady: function(res) {
		this.videoContext = uni.createVideoContext('myVideo');
	},
	onLoad(options) {
		const eventChannel = this.getOpenerEventChannel();
		let that = this;
		eventChannel.once('videoId', function(params) {
			that.videoId = params.videoId;
			that.videoType = params.videoType;
			if (that.videoType == 'mv') {
				that.getMVDetailInfo();
			} else {
				that.getVideoDetail();
			}
		});

		let statusBarHeight = uni.getSystemInfoSync()['statusBarHeight'];
		if (statusBarHeight >= 44) {
			this.pageHeight = '95vh';
		}
	},
	filters: {
		retainDoubleDigit: function(data) {
			// 将数据转万
			if (data > 100000000) {
				return (data / 100000000).toFixed(2) + '亿';
			} else {
				return (data / 10000).toFixed(2) + '万';
			}
		},
		timeTransformation: function(data) {
			var date = new Date(data);
			var year = date.getFullYear();
			var month = date.getMonth() + 1 <= 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
			var day = date.getDate() <= 9 ? '0' + date.getDate() : date.getDate();
			return year + '-' + month + '-' + day;
		}
	},
	onHide: function() {
		this.videoContext.pause();
	},
	computed:{
		isDark: {
			get() {
				return this.$store.state.isDark;
			},
			set(v) {
				this.$store.comnit('setisDark', v);
			}
		}
	},
	methods: {
		getMVDetailInfo: function() {
			//获取MV详情
			let that = this;
			uni.getStorage({
				key: 'cookie',
				success: function(cookieRes) {
					that.cookie = cookieRes.data;
					uni.request({
						url: 'https://wx.3dcw.cn/mv/detail',
						data: {
							mvid: that.videoId,
							cookie: cookieRes.data
						},
						success: res => {
							that.videoDetails = res.data.data;
							that.getMVurl();
						},
						fail: err => {
							console.log(err);
						}
					});
				},
				fail: err => {
					console.log(err);
				}
			});
		},
		getVideoDetail: function() {
			//获取视频详情
			let that = this;
			uni.getStorage({
				key: 'cookie',
				success: function(cookieRes) {
					that.cookie = cookieRes.data;
					uni.request({
						url: 'https://wx.3dcw.cn/video/detail',
						data: {
							id: that.videoId,
							cookie: cookieRes.data
						},
						success: res => {
							that.videoDetails = res.data.data;
							that.getVideoUrl();
						},
						fail: err => {
							console.log(err);
						}
					});
				},
				fail: err => {
					console.log(err);
				}
			});
		},
		getVideoUrl: function() {
			//获取视频链接
			let that = this;
			uni.request({
				url: 'https://wx.3dcw.cn/video/url',
				data: {
					id: that.videoId,
					cookie: that.cookie
				},
				success: res => {
					that.videoUrl = res.data.urls[0].url;
					that.getVideoDetailInfo();
					that.getrelatedVideoAll();
				},
				fail: err => {
					console.log(err);
				}
			});
		},
		getVideoDetailInfo: function() {
			//视频评论
			let that = this;
			uni.request({
				url: 'https://wx.3dcw.cn/comment/video',
				data: {
					id: that.videoId,
					cookie: that.cookie
				},
				success: res => {
					that.commentHot = res.data.comments;
				},
				fail: err => {
					console.log(err);
				}
			});
		},
		getrelatedVideoAll: function() {
			//相关视频
			let that = this;
			uni.request({
				url: 'https://wx.3dcw.cn/related/allvideo',
				data: {
					id: that.videoId,
					cookie: that.cookie
				},
				success: res => {
					that.relatedVideo = res.data.data;
				},
				fail: err => {
					console.log(err);
				}
			});
		},
		getMVurl: function() {
			//获取mv链接
			let that = this;
			uni.request({
				url: 'https://wx.3dcw.cn/mv/url',
				data: {
					id: that.videoId,
					cookie: that.cookie
				},
				success: res => {
					that.videoUrl = res.data.data.url;
					that.getMVCommentInfo();
					that.getrelatedVideoAll();
				},
				fail: err => {
					console.log(err);
				}
			});
		},
		switchNavigation: function(data) {
			//简介评论切换
			if (data === '简介') {
				this.showComments = false;
			} else {
				this.showComments = true;
			}
		},
		loadMore: function() {
			//上拉刷新
			this.bottomTips = 'loading';
			this.getExampleData();
		},
		getExampleData: function() {
			//刷新函数
			let that = this;
			let url = '';
			if (that.videoType == 'mv') {
				url = 'https://wx.3dcw.cn/comment/mv';
			} else {
				url = 'https://wx.3dcw.cn/comment/video';
			}

			uni.request({
				url: url,
				data: {
					cookie: that.cookie,
					id: this.videoId,
					limit: 20,
					offset: this.page * 20,
					before: this.commentHot[this.commentHot.length - 1].time
				},
				success: res => {
					let temporary = this.commentHot;
					let playlists = res.data.comments;
					this.commentHot = [...temporary, ...playlists];
					this.page++;
					this.bottomTips = '';
					if (res.data.total == this.commentHot.length) {
						that.bottomTips = 'nomore';
						setTimeout(function() {
							that.bottomTips = '';
						}, 1000);
					}
				}
			});
		},
		openVideoDatails: function(id) {
			//打开视频页
			let that = this;
			uni.getStorage({
				key: 'profile',
				success(res) {
					that.videoContext.pause();
					console.log(that.videoContext);
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
		getMVCommentInfo: function() {
			//获取MV评论
			let that = this;
			uni.request({
				url: 'https://wx.3dcw.cn/comment/mv',
				data: {
					id: that.videoId,
					cookie: that.cookie
				},
				success: res => {
					that.commentHot = res.data.comments;
				},
				fail: err => {
					console.log(err);
				}
			});
		}
	},
	onShow: function() {
		if(this.$store.getters.getisPlay){
			this.pauseAudio();
			this.$store.commit("setplayMessage",false);
		}
		if(this.videoContext){
			this.videoContext.play();
		}
		
		if (this.isDark) {
			uni.setNavigationBarColor({
				frontColor: '#ffffff',
				backgroundColor: '#333',
				animation: {
					duration: 400,
					timingFunc: 'easeIn'
				}
			});
		}
	}
};
</script>
