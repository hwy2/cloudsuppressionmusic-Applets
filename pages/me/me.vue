<template>
	<view class="me">
		<view class="main">
			<view class="profile">
				<view class="left"><image class="img" :src="userDetail.profile.avatarUrl" mode="aspectFit"></image></view>
				<view class="center">
					<view class="p1">
						<text class="span">{{ userDetail.profile.nickname }}</text>
					</view>
					<view class="p2">
						<text class="span">lv.{{ userDetail.level }}</text>
					</view>
				</view>
				<view class="right"><i class="iconfont iconzuojiantou-cu"></i></view>
			</view>

			<!-- 常见功能 -->

			<!-- 我喜欢的音乐 -->
			<view class="favoriteMusic">
				<view class="left">
					<view class="embedded"><image :src="userPlaylist.playlist[0].coverImgUrl" mode="aspectFit" class="img"></image></view>
				</view>
				<view class="center"  @click="sheetDetails(userPlaylist.playlist[0].id)">
					<text class="p1">我喜欢的音乐</text>
					<text class="p2">{{ userPlaylist.playlist[0].trackCount }}首</text>
				</view>
				<view class="right">
					<view class="intelligence" @click="getPlaylistMusic()">
						<i class=" iconfont iconxindong"><text class="span">心动模式</text></i>
					</view>
				</view>
			</view>

			<!-- 创建歌单 -->
			<view class="createSongList">
				<view class="bgc">
					<view class="top">
						<view class="left">
							<text class="p">创建歌单（{{ createSongLists.length }}）个</text>
						</view>
						<view class="right">
							<i class="iconfont iconjia1" @click="notImplemented()"></i>
							<i class="iconfont iconziyuan" @click="notImplemented()"></i>
						</view>
					</view>
					<view class="contentText">
						<scroll-view scroll-y="true" class="scroll-view ">
							<view class="scroll-item" v-for="(item, index) in createSongLists" :key="index">
								<view class="left" @click="sheetDetails(item.id)">
									<view class="le"><image :src="item.coverImgUrl" mode="aspectFit" class="img"></image></view>
									<view class="center">
										<text class="name">{{ item.name }}</text>
										<text class="trackCount">{{ item.trackCount }}首</text>
									</view>
								</view>
								<view class="right"><i class=" iconfont iconziyuan" @click="notImplemented()"></i></view>
							</view>
						</scroll-view>
					</view>
				</view>
			</view>

			<!-- 收藏歌单 -->
			<view class="createSongList collectionSongLists">
				<view class="bgc">
					<view class="top">
						<view class="left">
							<text class="p">收藏歌单（{{ collectionSongLists.length }}）个</text>
						</view>
						<view class="right"><i class="iconfont iconziyuan" @click="notImplemented()"></i></view>
					</view>
					<view class="contentText">
						<scroll-view scroll-y="true" class="scroll-view">
							<view class="scroll-item" v-for="(item, index) in collectionSongLists" :key="index">
								<view class="left" @click="sheetDetails(item.id)">
									<view class="le"><image :src="item.coverImgUrl" mode="aspectFit" class="img"></image></view>
									<view class="center" >
										<text class="name">{{ item.name }}</text>
										<text class="trackCount">{{ item.trackCount }}首 by {{ item.creator.nickname }}</text>
									</view>
								</view>

								<view class="right"><i class=" iconfont iconziyuan" @click="notImplemented()"></i></view>
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
import '@/static/less/me.less';
import musicPlaybar from '@/components/musicPlayBar/musicPlayBar.vue';
export default {
	components: { musicPlaybar },
	data() {
		return {
			userDetail: [], //用户信息
			userPlaylist: [], //用户歌单
			rendering: false, //渲染完成
			createSongLists: [], //创建歌单
			collectionSongLists: [], //收藏歌单
			songListId: '', //歌单id//2097071529
			songListVisible: false, //歌单详情
			cookie: ''
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
		getUserDetail: function(uid) {
			uni.showLoading({
				mask: true,
				title: '加载中...'
			});
			let that = this;
			uni.getStorage({
				key: 'cookie',
				success: function(cookieRes) {
					that.cookie = cookieRes.data;
					uni.request({
						url: 'https://wx.3dcw.cn/user/detail',
						method: 'GET',
						data: {
							t: Date.parse(new Date()),
							uid: uid,
							cookie: cookieRes.data
						},
						success: function(res) {
							that.userDetail = res.data;
						},
						fail: function(err) {
							console.log(err);
						}
					});
				},
				fail: err => {
					uni.showToast({
						icon: 'none',
						title: '未登录，无法查看'
					});

					setTimeout(function() {
						uni.hideToast();
					}, 3000);
				}
			});
		},
		getUserPlaylist: function(uid) {
			let that = this;
			uni.request({
				url: 'https://wx.3dcw.cn/user/playlist',
				method: 'GET',
				data: {
					t: Date.parse(new Date()),
					uid: uid
				},
				success: function(res) {
					that.userPlaylist = res.data;
					that.songListId = res.data.playlist[0].id;
					uni.hideLoading();
					for (let i = 1; i < res.data.playlist.length; i++) {
						if (uid == res.data.playlist[i].creator.userId) {
							that.createSongLists.push(res.data.playlist[i]);
						} else {
							that.collectionSongLists.push(res.data.playlist[i]);
						}
					}
				}
			});
		},
		getPlaylistMusic: function() {
			uni.showLoading({
				mask:true,
				title:"加载中..."
			})
			let that = this;
			let songlist = that.$store.getters.getsongInfo;
			that.getIntelligence(songlist.id ? songlist.id : songlist.resourceId);
		},
		notImplemented: function() {
			uni.showToast({
				title: '未实现',
				icon: 'none'
			});
		},
		getIntelligence: function(songId) {
			let that = this;
			uni.request({
				url: 'https://wx.3dcw.cn/playmode/intelligence/list',
				method: 'GET',
				data: {
					t: Date.parse(new Date()),
					cookie: that.cookie,
					id: songId,
					pid: that.songListId
				},
				success: function(res) {
					
					that.playMusic(res.data.data[0].songInfo);
					let songInfoArray = [];
					res.data.data.forEach(function(item) {
						songInfoArray.push(item.songInfo);
					});
					that.$store.commit('setplaylist', songInfoArray);
					uni.hideLoading();
				},
				fail: function(err) {
					console.log(err);
				}
			});
		},
		playMusic: function(songInfo) {
			songInfo['picUrl'] = songInfo.al.picUrl;
			this.getplayMusic(songInfo.id, songInfo);
		},
		sheetDetails: function(sheetID) {
			console.log(sheetID)
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
		}
	},
	created() {
		let that = this;
		uni.getStorage({
			key: 'profile',
			success: function(res) {
				that.getUserDetail(res.data.userId);
				that.getUserPlaylist(res.data.userId);
			}
		});
	}
};
</script>

<style></style>
