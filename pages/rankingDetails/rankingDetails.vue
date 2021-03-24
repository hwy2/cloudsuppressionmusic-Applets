<template>
	<view class="songListDetails rankingDetails" :class="isDark ? 'dark' : ''">
		<view class="topnavbar">
			<view class="status_bar" :style="{ height: headerPadding }"></view>
			<uni-nav-bar left-icon="back" @click-left="back()" :background-color="navbarBGC" :border="false">
				<view class="narBarTitle">{{ songInformation.name }}</view>
			</uni-nav-bar>
		</view>

		<!-- 歌单封面 -->
		<view class="information">
			<view class="left">
				<image :src="songInformation.coverImgUrl" mode="aspectFit" class="img"></image>
				<i class="iconfont iconicon--">{{ songInformation.playCount | retainDoubleDigit }}</i>
			</view>
			<view class="rigth">
				<view class="topTitle">
					<text class="p">{{ songInformation.name }}</text>
				</view>
				<view class="user">
					<image class="img" :src="songInformation.creator.avatarUrl" mode="aspectFit"></image>
					<text class="nickname">{{ songInformation.creator.nickname }}</text>
				</view>
				<view class="details">
					<text :title="songInformation.description" class="description" selectable="true">{{ songInformation.description }}</text>
				</view>
			</view>
		</view>

		<!-- 歌单歌曲详情 -->
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
						<view class="iconfont iconbofang-" @click="getplayMusicAll()">
							<text class="icoText">播放全部 (共{{ songInformation.trackCount }}首)</text>
						</view>
					</view>
					<!-- <view class="right">
						<view class="iconfont icongengduo1"><text class="icoText">多 选</text></view>
					</view> -->
				</view>

				<!-- song 详情 -->
				<view class="songWarp">
					<scroll-view class="scroll-view_H" scroll-y="true">
						<view class="scroll-view-item_H  silde" v-for="(item, indexs) in songplayList" :key="indexs">
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
import '@/static/less/songListDetails.less';
import uniNavBar from '@/components/uni-nav-bar/uni-nav-bar.vue';
import musicPlaybar from '@/components/musicPlayBar/musicPlayBar.vue';
export default {
	components: { uniNavBar, musicPlaybar },
	data() {
		return {
			headerPadding: '', //状态栏高度
			songListId: '', //歌单id
			songplayList: [],
			trackIds: [],
			navbarBGC:"#aea9ad",
			songInformation: []
		};
	},
	onLoad() {
		this.headerPadding = uni.getSystemInfoSync()['statusBarHeight'] + 'px';
		const eventChannel = this.getOpenerEventChannel();
		let that = this;
		eventChannel.once('sheetDetails', function(params) {
			that.songListId = params.songListId;
		});

		console.log('接收id：' + that.songListId);
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
			this.navbarBGC="#333"
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

	methods: {
		back: function() {
			uni.navigateBack({
				delta: 1
			});
		},
		getPlaylistMusic: function() {
			uni.showLoading({
				mask: true,
				title: '加载中...'
			});
			let that = this;
			// 获取歌单歌曲
			uni.getStorage({
				key: 'cookie',
				success: function(cookieRes) {
					uni.request({
						url: 'https://wx.3dcw.cn/playlist/detail',
						method: 'GET',
						data: {
							t: Date.parse(new Date()),
							id: that.songListId,
							cookie: cookieRes.data
						},
						success: function(res) {
							console.log(res.data)
							if (res.data.code === 200) {
								let trackSongId = [];
								let trackSongIdString = '';
								that.trackIds = res.data.playlist.trackIds;
								that.songInformation = res.data.playlist;

								for (let i = 0; i < that.trackIds.length; i++) {
									trackSongId.push(that.trackIds[i].id);
								}
								trackSongIdString = trackSongId.toString();

								that.getsongDetail(trackSongIdString, cookieRes.data);
							}
						},
						fail: function(err) {
							console.log(err);
							uni.hideLoading();
						}
					});
				}
			});
		},
		getsongDetail: function(trackSongIds, cookie) {
			let that = this;
			that.songplayList=[];
			uni.request({
				url: 'https://wx.3dcw.cn/song/detail',
				method: 'GET',
				data: {
					ids: trackSongIds,
					cookie: cookie
				},
				success: function(res) {
					uni.hideLoading();
					if (res.data.code == 200) {
						that.songplayList = res.data.songs;
					} else {
						uni.showToast({
							icon: 'none',
							title: '获取失败'
						});
					}
				},
				fail: function(err) {
					console.log(err);
					uni.hideLoading();
				}
			});
		},
		playMusic: function(songInfo) {
			songInfo['picUrl'] = songInfo.al.picUrl;
			this.getplayMusic(songInfo.id, songInfo);
			
		},
		getplayMusicAll: function() {
			uni.showLoading({
				mask:true,
				title:"加载中..."
			})
			let that = this;
			that.$store.commit('setplaylist', that.songplayList);
			let songlist = that.songplayList;
			that.playMusic(songlist[0]);
		}
	},
	created() {
		this.getPlaylistMusic();
	}
};
</script>

<style lang="less">
.status_bar {
	background-color: #aea9ad;
}
</style>
