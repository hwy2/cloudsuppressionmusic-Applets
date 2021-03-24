<template>
	<view class="latestMusic" :class="isDark ? 'dark' : ''">
		<!-- 顶部导航栏 -->
		<view class="navbarSorll">
			<scroll-view scroll-x="true" :scroll-into-view="scrollLeft" scroll-left="0">
				<view :class="{ active: item.activity }" v-for="(item, index) in category" :key="index" :id="'text' + index" @click="getSelect(index, item.name)">
					<text>{{ item.name }}</text>
				</view>
			</scroll-view>
		</view>

		<!-- 内容区 -->
		<view class="contentArea" @touchstart="start" @touchend="end">
			<view class="top"><image class="banner" :src="imgSrc" mode="scaleToFill"></image></view>
			<!-- song列表 -->
			<view class="bottomContainer">
				<view class="bgc">
					<!-- song 工具栏 -->
					<view class="songsBar">
						<view class="left">
							<view class="iconfont iconbofang-" @click="playMusicAll()">
								<text class="icoText">播放全部</text>
								<text class="sumber">({{ dailySongs.length }})</text>
							</view>
						</view>
						<!-- <view class="right">
							<view class="iconfont icongengduo1"><text class="icoText">多 选</text></view>
						</view> -->
					</view>

					<view class="clear"></view>

					<!-- song 详情 -->
					<view class="songWarp">
						<scroll-view class="scroll-view_H" scroll-y="true">
							<view class="scroll-view-item_H  silde" v-for="(item, indexs) in dailySongs" :key="indexs">
								<view class="left" @click="playMusic(item)" v-if="item.song">
									<view class="le"><image :src="item.picUrl" mode="aspectFit" class="img" /></view>

									<view class="center">
										<view class="p">
											<text class="text1">{{ item.name }}</text>
										</view>
										<view class="p2">
											<text>{{ item.song.artists[0].name }}</text>
											<text>&nbsp;-&nbsp;{{ item.song.album.name }}</text>
										</view>
									</view>
								</view>
								<view class="left" @click="playMusic(item)" v-else>
									<view class="le"><image :src="item.album.picUrl" mode="aspectFit" class="img" /></view>

									<view class="center">
										<view class="p">
											<text class="text1">{{ item.name }}</text>
										</view>
										<view class="p2">
											<text>{{ item.artists[0].name }}</text>
											<text>&nbsp;-&nbsp;{{ item.album.name }}</text>
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
		</view>

		<!-- 播放区 -->
		<music-playbar v-show="isShow"></music-playbar>
	</view>
</template>

<script>
import '@/static/less/latestMusic.less';
import musicPlaybar from '@/components/musicPlayBar/musicPlayBar.vue';
export default {
	components: { musicPlaybar },
	data() {
		return {
			category: [
				{
					activity: true,
					id: 0,
					name: '推荐',
					imgSrc: 'https://www.3dcw.cn/image/d2a.jpg'
				},
				{
					activity: false,
					id: 7,
					name: '华语',
					imgSrc: 'https://www.3dcw.cn/image/d28.jpg'
				},
				{
					activity: false,
					id: 96,
					name: '欧美',
					imgSrc: 'https://www.3dcw.cn/image/d27.jpg'
				},
				{
					activity: false,
					id: 8,
					name: '日本',
					imgSrc: 'https://www.3dcw.cn/image/d29.jpg'
				},
				{
					activity: false,
					id: 16,
					name: '韩国',
					imgSrc: 'https://www.3dcw.cn/image/d2_.jpg'
				}
			],
			dailySongs: [],
			cookie: '',
			imgSrc: 'https://www.3dcw.cn/image/d2a.jpg',
			startData: {
				//滑动偏移量
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
		},
		isDark: {
			get() {
				return this.$store.state.isDark;
			},
			set(v) {
				this.$store.comnit('setisDark', v);
			}
		}
	},
	onShow() {
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
	},
	methods: {
		getPersonalized: function(cookie) {
			let that = this;
			uni.showLoading({
				title: '加载中...',
				mask: true
			});
			uni.request({
				url: 'https://wx.3dcw.cn/personalized/newsong',
				method: 'GET',
				data: {
					cookie: cookie,
					limit: 50
				},
				success: res => {
					console.log(res);
					that.dailySongs = res.data.result;
					uni.hideLoading();
				},
				fail: err => {
					console.log(err);
					uni.hideLoading();
				}
			});
		},
		getTopSong: function(id) {
			let that = this;
			uni.showLoading({
				title: '加载中...',
				mask: true
			});
			uni.request({
				url: 'https://wx.3dcw.cn/top/song',
				method: 'GET',
				data: {
					cookie: that.cookie,
					type: id
				},
				success: res => {
					console.log(res);
					that.dailySongs = res.data.data;
					uni.hideLoading();
				},
				fail: err => {
					console.log(err);
					uni.hideLoading();
				}
			});
		},

		getSelect: function(index, name) {
			this.dailySongs = [];
			this.imgSrc = this.category[index].imgSrc;
			this.category.forEach(item => {
				item['activity'] = false;
			});
			this.category[index].activity = true;

			if (name == '推荐') {
				this.getPersonalized(this.cookie);
			} else {
				this.getTopSong(this.category[index].id);
			}
		},
		playMusicAll: function() {
			uni.showLoading({
				mask: true,
				title: '加载中'
			});
			this.$store.commit('setplaylist', this.dailySongs);
			this.$store.commit('setserialNumber', 0);
			let songlist = this.dailySongs;
			this.playMusic(songlist[0]);
		},

		playMusic: function(songInfo) {
			if (this.category[0].activity) {
				songInfo['picUrl'] = songInfo.picUrl;
			} else {
				songInfo['picUrl'] = songInfo.album.picUrl;
			}

			this.getplayMusic(songInfo.id, songInfo);
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
				let i=0;
				while(i<this.category.length){
					if (this.category[i].activity && i <= this.category.length - 1 && i - 1 >= 0) {
						this.category[i].activity = false;
						this.category[i - 1].activity = true;
						this.$nextTick(function() {
							this.scrollLeft = 'text' + (i - 1);
						});
						this.scrollLeft = '';
						this.getSelect(i - 1, this.category[i - 1].name);
						break;
					}
					i++;
				}
			} else if (subX < -100) {
				console.log('左滑');
				let i=0;
				while(i<this.category.length){
					if (this.category[i].activity && i <= this.category.length - 1 && i + 1 <= this.category.length - 1) {
						this.category[i].activity = false;
						this.category[i + 1].activity = true;
						this.$nextTick(function() {
							this.scrollLeft = 'text' + (i + 1);
						});
						this.scrollLeft = '';
						this.getSelect(i + 1, this.category[i + 1].name);
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
		let that = this;
		uni.getStorage({
			key: 'cookie',
			success: function(res) {
				that.cookie = res.data;
				that.getPersonalized(res.data);
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

