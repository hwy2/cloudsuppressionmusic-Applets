<template>
	<view class="Daily">
		<view class="topBanner" :style="{ height: topBannerHeight }">
			<view class="bgc" :style="{ background: backgroudURl }">
				<view class="dateTime">
					<view class="p">
						<text class="large">{{ day }}</text>
						<text>/{{ month }}</text>
					</view>
					<view class="history"><text class="push">历史日推</text></view>
				</view>
			</view>
			<view class="coating" :style="{ height: topBannerHeight }"></view>
		</view>

		<!-- song列表 -->
		<view class="bottomContainer">
			<view class="bgc">
				<!-- song 顶部装饰 -->
				<view class="topStyle">
					<view class="left">
						<view class="div">
							<text class="hybrid1"></text>
							<text class="hybrid2"></text>
						</view>
					</view>
					<view class="right">
						<view class="div">
							<text class="hybrid1"></text>
							<text class="hybrid2"></text>
						</view>
					</view>
				</view>

				<!-- song 工具栏 -->
				<view class="songsBar">
					<view class="left">
						<view class="iconfont iconbofang-" @click="playMusicAll()"><text class="icoText">播放全部</text></view>
					</view>
					<!-- <view class="right">
						<view class="iconfont icongengduo1"><text class="icoText">多 选</text></view>
					</view> -->
				</view>

				<!-- song 详情 -->
				<view class="songWarp">
					<scroll-view class="scroll-view_H" scroll-y="true">
						<view class="scroll-view-item_H  silde" v-for="(item, indexs) in dailySongs" :key="indexs">
							<view class="left" @click="playMusic(item)">
								<view class="le"><image :src="item.al.picUrl" mode="aspectFit" class="img" /></view>

								<view class="center">
									<view class="p">
										<text class="text1">{{ item.name }}</text>
									</view>
									<view class="p2">
										<text>{{ item.ar[0].name }}</text>
										<text>&nbsp;-&nbsp;{{ item.al.name }}</text>
									</view>
								</view>
							</view>
							<view class="right">
								<view class="icon">
									<view v-if="item.mv > 0" class="iconfont iconbofang"></view>
									<view v-else class="iconfont"></view>
									<view class="iconfont iconziyuan"></view>
								</view>
							</view>
						</view>
					</scroll-view>
				</view>
			</view>
		</view>

		<!-- 播放区 -->
		<music-playbar v-show="isShow"></music-playbar>
	</view>
</template>

<script>
import '@/static/less/dailyRecommendation.less';
import musicPlaybar from '@/components/musicPlayBar/musicPlayBar.vue';
export default {
	components: { musicPlaybar },
	data() {
		return {
			month: '',
			day: '',
			backgroudURl: '',
			dailySongs: '', //每日推荐歌曲
			topBannerHeight: '20vh' //头图
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

	methods: {
		getDailyMusic: function(cookie) {
			uni.showLoading({
				title: '加载中...',
				mask: true
			});
			let that = this;
			// 获取每日推荐歌曲
			uni.request({
				url: 'https://wx.3dcw.cn/recommend/songs',
				method: 'GET',
				data: {
					cookie: cookie,
					t: Date.parse(new Date())
				},
				success(res) {
					console.log('每日推荐', res.data);
					if (res.data.code === 200) {
						that.backgroudURl = 'url(' + res.data.data.dailySongs[0].al.picUrl + ') no-repeat center center;background-size: cover;';
						that.dailySongs = res.data.data.dailySongs;
						uni.hideLoading();
					}
				},
				fail(err) {
					uni.hideLoading();
					console.log('每日推荐获取失败:' + err);
				}
			});
		},
		playMusic: function(songInfo) {
			songInfo['picUrl'] = songInfo.al.picUrl;
			this.getplayMusic(songInfo.id, songInfo);
		},
		playMusicAll: function() {
			uni.showLoading({
				mask:true,
				title:"加载中"
			})
			this.$store.commit('setplaylist', this.dailySongs);
			this.$store.commit('setserialNumber', 0);
			let songlist = this.dailySongs;
			this.playMusic(songlist[0]);
		}
	},
	created() {
		let data = new Date();
		this.month = data.getMonth() < 9 ? '0' + (data.getMonth() + 1) : data.getMonth() + 1;
		this.day = data.getDate() <= 9 ? '0' + data.getDate() : data.getDate();

		let that = this;
		uni.getStorage({
			key: 'cookie',
			success: function(res) {
				that.getDailyMusic(res.data);
			},
			fail: err => {
				console.log(err);
				uni.showToast({
					icon: 'none',
					title: '未登录，无法查看'
				});

				setTimeout(function() {
					uni.hideToast();
				}, 3000);
			}
		});
	}
};
</script>
