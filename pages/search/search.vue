<template>
	<view class="search">
		<view class="topnavbar">
			<view class="status_bar" :style="{ height: headerPadding }"></view>
			<uni-nav-bar left-icon="back" @click-left="back()" background-color="#ffffff" title="搜索"></uni-nav-bar>
		</view>

		<view class="container" :style="{ padding: containerPadding + ' 0 0' }">
			<view class="searchBar">
				<zy-search
					:is-focus="true"
					:theme="themeClass"
					:show-want="showwant"
					:speechEngine="speechEngine"
					:hot-list="hotList"
					:showHot="showHot"
					@getSearchText="getSearchText"
				></zy-search>
			</view>

			<view class="resultBlock" v-if="!showHot">
				<!-- 搜索分类 -->
				<view class="classificationList" v-show="resultForT">
					<view class="navbarSorll">
						<scroll-view scroll-x="true" scroll-left="0">
							<view :class="item.active ? 'active' : ''" @click="selectCategoryFun(item, index)" v-for="(item, index) in searchCategory" :key="index">
								<text>{{ item.name }}</text>
							</view>
						</scroll-view>
					</view>
				</view>

				<!-- 单曲 -->
				<view class="singleResults" v-if="singleVisible" @touchmove.stop.prevent>
					<hr-pull-load
						@refresh="refresh"
						@loadMore="loadBottomSingle"
						:height="-1"
						:pullHeight="50"
						:maxHeight="100"
						:lowerThreshold="200"
						:bottomTips="bottomTips"
						:isAllowPull="false"
						:isTab="true"
						ref="singleVisible"
					>
						<scroll-view class="scroll-view_H" scroll-y="true">
							<view class="scroll-view-item_H  silde" v-for="(item, indexs) in singleList" :key="indexs">
								<view class="left" @click="playMusic(item)">
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
					</hr-pull-load>
				</view>

				<!-- 歌单 -->
				<view class="playlistsResults" v-if="playlistsVisible" @touchmove.stop.prevent>
					<hr-pull-load
						@refresh="refresh"
						@loadMore="loadBottomPlaylists"
						:height="-1"
						:pullHeight="50"
						:maxHeight="100"
						:lowerThreshold="200"
						:bottomTips="bottomTips"
						:isAllowPull="false"
						:isTab="true"
						ref="playlistsVisible"
					>
						<scroll-view class="scroll-view_H" scroll-y="true">
							<view class="scroll-view-item_H  silde" v-for="(item, indexs) in playlistsList" :key="indexs">
								<view class="left" @click="opsheetWindow(item.id)">
									<view class="le"><image :src="item.coverImgUrl" mode="aspectFit" class="img" /></view>
									<view class="center">
										<view class="p">
											<text class="text1">{{ item.name }}</text>
										</view>
										<view class="p2">
											<text style="padding-right: 10upx;">{{ item.trackCount }}首 &nbsp;</text>
											<text v-if="item.creator">&nbsp;by&nbsp;{{ item.creator.nickname }}</text>
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
					</hr-pull-load>
				</view>

				<!-- 视频 -->
				<view class="videos" v-if="videosVisible" @touchmove.stop.prevent>
					<hr-pull-load
						@refresh="refresh"
						@loadMore="loadBottomVideo"
						:height="-1"
						:pullHeight="50"
						:maxHeight="100"
						:lowerThreshold="200"
						:bottomTips="bottomTips"
						:isAllowPull="false"
						:isTab="true"
						ref="videosVisible"
					>
						<uni-grid :column="2" :show-border="false" :square="false">
							<uni-grid-item v-for="(item, index) in videosList" :key="index">
								<view class="warp">
									<view class="image">
										<image :src="item.coverUrl" :alt="item.data.title" ref="imageError" mode="aspectFill" />
										<!-- <image :src="item.data.creator.avatarUrl" :alt="item.data.creator.nickname" mode="aspectFill" /> -->

										<!-- <text>{{ item.data.durationms | formatMilliseconds }}</text> -->
									</view>
									<view class="description">
										<text class="text">{{ item.title }}</text>
									</view>
									<!-- <view class="items">
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
									</view> -->
								</view>
							</uni-grid-item>
						</uni-grid>
					</hr-pull-load>
				</view>
			</view>
		</view>

		<!-- 播放区 -->
		<music-playbar v-show="isShow"></music-playbar>
	</view>
</template>

<script>
import '@/static/less/search.less';
import zySearch from '../../components/zy-search/zy-search.vue';
import musicPlaybar from '@/components/musicPlayBar/musicPlayBar.vue';
export default {
	components: {
		zySearch,
		musicPlaybar
	},
	data() {
		return {
			headerPadding: '',
			themeClass: 'circle',
			speechEngine: 'baidu', //语音识别引擎
			hotList: [], //初始化推荐列表
			showHot: true, //显示历史记录
			showwant: true, //显示热搜
			resultForT: false, //显示分类栏
			bottomTips: '', //上拉标签状态
			searchCategory: [
				{
					id: 1,
					name: '单曲',
					active: true
				},
				{
					id: 1000,
					name: '歌单',
					active: false
				},
				{
					id: 1014,
					name: '视频',
					active: false
				}
				// {
				// 	id: 100,
				// 	name: '歌手',
				// 	active: false
				// },
				// {
				// 	id: 10,
				// 	name: '专辑',
				// 	active: false
				// },
				// {
				// 	id: 1002,
				// 	name: '用户',
				// 	active: false
				// }
			], //搜索分类
			singleList: [], //单曲结果
			playlistsList: [], //歌单结果
			videosList: [], //视频结果
			singerList: [], //歌手结果
			albumList: [], //专辑结果
			subscriberList: [], //用户结果
			singleVisible: false, //单曲显示
			playlistsVisible: false, //歌单显示
			videosVisible: false, //视频显示
			singerVisible: false, //歌手显示
			albumVisible: false, //专辑显示
			subscriberVisible: false, //用户显示
			containerPadding: '',
			keywords: '', //搜索词
			page: 1 //页数
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
		back: function() {
			uni.navigateBack({
				delta: 1
			});
		},
		getSearchText(e) {
			if (e) {
				this.showHot = false;
				this.showwant = false;
			} else {
				this.showHot = true;
				this.showwant = true;
			}

			this.keywords = e;
			this.getSearchResult(e, 1);
		},
		getHotSearch: function() {
			let that = this;
			uni.request({
				url: 'https://wx.3dcw.cn/search/hot',
				success: res => {
					that.hotList = res.data.result.hots;
				},
				fail: err => {
					console.log(err);
				}
			});
		},
		playMusic: function(songinfos) {
			this.getSongDetail(songinfos.id, songinfos);
		},
		getSongDetail: function(id, songinfos) {
			uni.request({
				url: 'https://wx.3dcw.cn/song/detail',
				data: {
					ids: id,
					cookie: uni.getStorage('cookie')
				},
				success: res => {
					console.log('歌曲详情搜索', res.data);
					this.songinfo = res.data;
					songinfos['picUrl'] = this.songinfo.songs[0].al.picUrl;
					this.$store.commit('setsongInfo', songinfos);
					this.getplayMusic(id, songinfos);
				},
				fail: err => {
					console.log(err);
				}
			});
		},
		getSearchResult: function(keyword, typeId) {
			let that = this;
			(this.singleVisible = false),
				(this.playlistsVisible = false),
				(this.videosVisible = false),
				(this.singerVisible = false),
				(this.albumVisible = false),
				(this.subscriberVisible = false),
				uni.showLoading({
					mask: true,
					title: '加载中...'
				});
			uni.request({
				url: 'https://wx.3dcw.cn/search',
				data: {
					keywords: keyword,
					type: typeId,
					cookie: uni.getStorage('cookie')
				},
				success: res => {
					that.resultForT = true;
					if (typeId == 1) {
						this.singleVisible = true;
						this.playlistsVisible = false;
						this.videosVisible = false;
						this.singerVisible = false;
						this.albumVisible = false;
						this.subscriberVisible = false;
						this.singleList = res.data.result.songs;
					} else if (typeId == 1000) {
						this.singleVisible = false;
						this.playlistsVisible = true;
						this.videosVisible = false;
						this.singerVisible = false;
						this.albumVisible = false;
						this.subscriberVisible = false;
						this.playlistsList = res.data.result.playlists;
					} else if (typeId == 1014) {
						this.singleVisible = false;
						this.playlistsVisible = false;
						this.videosVisible = true;
						this.singerVisible = false;
						this.albumVisible = false;
						this.subscriberVisible = false;
						this.videosList = res.data.result.videos;
					} else if (typeId == 100) {
						this.singleVisible = false;
						this.playlistsVisible = false;
						this.videosVisible = false;
						this.singerVisible = true;
						this.albumVisible = false;
						this.subscriberVisible = false;
						this.singerList = res.data.result.artists;
					} else if (typeId == 10) {
						this.singleVisible = false;
						this.playlistsVisible = false;
						this.videosVisible = false;
						this.singerVisible = false;
						this.albumVisible = true;
						this.subscriberVisible = false;
						this.albumList = res.data.result.albums;
					} else if (typeId == 1002) {
						this.singleVisible = false;
						this.playlistsVisible = false;
						this.videosVisible = false;
						this.singerVisible = false;
						this.albumVisible = false;
						this.subscriberVisible = true;
						this.subscriberList = res.data.result.userprofiles;
					} else {
						return;
					}
					uni.hideLoading();
				},
				fail: err => {
					console.log(err);
					uni.hideLoading();
				}
			});
		},
		selectCategoryFun: function(obj, index) {
			this.searchCategory.forEach(function(item) {
				item.active = false;
			});
			this.searchCategory[index].active = true;
			this.page = 1;
			this.getSearchResult(this.keywords, obj.id);
		},
		opsheetWindow: function(sheetID) {
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

		loadBottomVideo: function() {
			this.bottomTips = 'loading';
			let that = this;
			uni.request({
				url: 'https://wx.3dcw.cn/search',
				data: {
					keywords: this.keywords,
					cookie: uni.getStorage('cookie'),
					type: 1014,
					limit: 30,
					offset: this.page * 30
				},
				success: res => {
					console.log('搜索', res.data);
					let videosList = that.videosList;
					let videos = res.data.result.videos;
					that.videosList = [...videosList, ...videos];
					that.page++;
					that.bottomTips = '';
					if (that.videosList.length >= res.data.result.videoCount) {
						that.bottomTips = 'nomore';
						setTimeout(function() {
							that.bottomTips = '';
						}, 500);
					}
				},
				fail: err => {
					that.bottomTips = '';
					console.log(err);
				}
			});
		},
		loadBottomPlaylists: function() {
			this.bottomTips = 'loading';
			let that = this;
			uni.request({
				url: 'https://wx.3dcw.cn/search',
				data: {
					keywords: this.keywords,
					cookie: uni.getStorage('cookie'),
					type: 1000,
					limit: 30,
					offset: this.page * 30
				},
				success: res => {
					console.log('搜索', res.data);
					let playlistsList = that.playlistsList;
					let playlists = res.data.result.playlists;
					that.playlistsList = [...playlistsList, ...playlists];
					that.page++;
					that.bottomTips = '';
					if (that.videosList.length >= res.data.result.videoCount) {
						that.bottomTips = 'nomore';
						setTimeout(function() {
							that.bottomTips = '';
						}, 500);
					}
				},
				fail: err => {
					that.bottomTips = '';
					console.log(err);
				}
			});
		},
		loadBottomSingle: function() {
			this.bottomTips = 'loading';
			let that = this;
			uni.request({
				url: 'https://wx.3dcw.cn/search',
				data: {
					keywords: this.keywords,
					cookie: uni.getStorage('cookie'),
					type: 1,
					limit: 30,
					offset: this.page * 30
				},
				success: res => {
					console.log('搜索', res.data);
					let singleList = that.singleList;
					let songs = res.data.result.songs;
					that.singleList = [...singleList, ...songs];
					that.page++;
					that.bottomTips = '';
					if (that.videosList.length >= res.data.result.videoCount) {
						that.bottomTips = 'nomore';
						setTimeout(function() {
							that.bottomTips = '';
						}, 500);
					}
				},
				fail: err => {
					that.bottomTips = '';
					console.log(err);
				}
			});
		}
	},
	onLoad() {
		this.headerPadding = uni.getSystemInfoSync()['statusBarHeight'] + 'px';
		this.containerPadding = uni.getSystemInfoSync()['statusBarHeight'] + 44.5 + 'px';
	},
	created() {
		this.getHotSearch();
	}
};
</script>

<style></style>
