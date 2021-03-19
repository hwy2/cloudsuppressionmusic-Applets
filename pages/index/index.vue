<template>
	<view class="home" :class="isDark ? 'dark' : ''">
		<!-- 状态栏、标题栏 -->
		<view class="topnavbar">
			<view class="status_bar" :style="{ height: headerPadding }"></view>
			<uni-nav-bar title="网抑云"></uni-nav-bar>
			<!-- <uni-nav-bar left-icon="bars" title="网抑云" @click-left="openDrawer()"></uni-nav-bar> -->
		</view>

		<!-- 内容区 -->
		<view class="container" :style="{ 'padding-top': containerPaddingTop }">
			<!-- <view class="search"><uni-search-bar @confirm="search" @input="input"></uni-search-bar></view> -->
			<view class="search">
				<view class="warp" @click="openSearch()">
					<uni-icons color="#999999" size="18" type="search" class="uni-searchbar__box-icon-search" />
					<text class="uni-searchbar__text-placeholder">请输入搜索内容</text>
				</view>
			</view>
			<!-- 顶部banner 轮播 -->
			<view class="banner">
				<swiper class="swiper" :indicator-dots="false" :autoplay="true" :interval="3000" :duration="500" :circular="true">
					<swiper-item v-for="(item, index) in swipeList" :key="index">
						<view class="swiper-item">
							<image :src="item.pic" mode="aspectFit"></image>
							<view :style="{ background: item.titleColor }">{{ item.typeTitle }}</view>
						</view>
					</swiper-item>
				</swiper>
			</view>

			<!-- 二级导航 -->
			<view class="navigation">
				<uni-grid :column="5" :show-border="false" :square="false">
					<uni-grid-item v-for="(item, index) in iconList" :key="index">
						<view class="holder" @click="middleMethods(index)">
							<image :src="item.iconUrl" mode="aspectFit"></image>
							<text v-if="index === 0">{{ day }}</text>
						</view>
						<text class="explain">{{ item.name }}</text>
					</uni-grid-item>
				</uni-grid>
			</view>

			<!-- 推荐歌单 -->
			<view class="recommendation" v-if="recommendedSongList != '' && recommendedSongList.creatives.length > 0">
				<view class="topTile">
					<view class="left">
						<text>
							<text>{{ recommendedSongList.uiElement.mainTitle.title }}</text>
							{{ recommendedSongList.uiElement.subTitle.title }}
						</text>
					</view>
					<view class="right">
						<view @click="jumpSheet('推荐')"><text>查看更多</text></view>
					</view>
				</view>

				<view class="concentration">
					<scroll-view class="scroll-view_H" scroll-x="true" scroll-left="0">
						<view class="scroll-view-item_H silde" v-for="item in recommendedSongList.creatives" :key="item.creativeId">
							<view class="warp">
								<view class="box" @click="sheetDetails(item.creativeId)">
									<image :src="item.uiElement.image.imageUrl" mode="aspectFit"></image>
									<view>
										<i class="iconfont iconicon--">{{ item.resources[0].resourceExtInfo.playCount | retainDoubleDigit }}</i>
									</view>
								</view>
								<view class="text">
									<text class="textitem">{{ item.uiElement.mainTitle.title }}</text>
								</view>
							</view>
						</view>
					</scroll-view>
				</view>
			</view>

			<!-- 歌曲推荐 -->
			<view class="recommendation songNew" v-if="personalTailor != '' && personalTailor.creatives.length > 0">
				<view class="topTile">
					<view class="left">
						<text>
							<text>{{ personalTailor.uiElement.mainTitle.title }}</text>
							{{ personalTailor.uiElement.subTitle.title }}
						</text>
					</view>
					<view class="right">
						<view @click="playMusicAll()">
							<i class="iconfont iconbofang"></i>
							<text>播放全部</text>
						</view>
					</view>
				</view>

				<view class="concentration">
					<swiper class="swiper" :indicator-dots="false" :autoplay="false" :interval="3000" :duration="500" :circular="false">
						<swiper-item v-for="(item, index) in personalTailor.creatives" :key="index">
							<scroll-view class="smallList" scroll-x="true" scroll-left="0">
								<view
									class="towsilde"
									v-for="(song, indexs) in item.resources"
									:key="indexs"
									@click="playMusic(song.resourceExtInfo.songData, song.uiElement.image.imageUrl)"
								>
									<view class="left"><image :src="song.uiElement.image.imageUrl" mode="aspectFit" /></view>
									<view class="center">
										<view>
											<text>{{ song.uiElement.mainTitle.title }}</text>
											&nbsp;
										</view>
										<view>{{ song.resourceExtInfo.artists[0].name }}</view>
									</view>
									<view class="right">
										<view class="icon"><i class="iconfont iconbofang"></i></view>
									</view>
								</view>
							</scroll-view>
						</swiper-item>
					</swiper>
				</view>
			</view>

			<!-- 音乐日历 -->
			<view class="musicCalendar" v-if="musicCalendar != '' && musicCalendar.creatives.length > 0">
				<view class="details">
					<view class="top">
						<view class="p">
							<i class="iconfont iconyinle"><text>音乐日历</text></i>
						</view>
					</view>
					<view class="contentsd">
						<swiper class="swiper" :indicator-dots="false" :autoplay="true" :interval="5000" :duration="500" :circular="true">
							<swiper-item v-for="(item, index) in musicCalendar.creatives" :key="index">
								<view class="swiper-item">
									<view class="left">
										<text v-if="index == 0">今天</text>
										<text v-else>明天</text>
										<text>{{ item.resources[0].uiElement.mainTitle.title }}</text>
									</view>
									<view class="right"><image :src="item.resources[0].uiElement.image.imageUrl" mode="aspectFit"></image></view>
								</view>
							</swiper-item>
						</swiper>
					</view>
				</view>
			</view>

			<!-- 专属场景歌单推荐 -->
			<view class="recommendation" v-if="exclusiveScene != '' && exclusiveScene.creatives.length > 0">
				<view class="topTile">
					<view class="left">
						<text>
							<text>{{ exclusiveScene.uiElement.mainTitle.title }}</text>
							{{ exclusiveScene.uiElement.subTitle.title }}
						</text>
					</view>
					<view class="right">
						<view @click="jumpSheet('官方')"><text>查看更多</text></view>
					</view>
				</view>

				<view class="concentration">
					<scroll-view class="scroll-view_H" scroll-x="true" scroll-left="0">
						<view class="scroll-view-item_H silde" v-for="item in exclusiveScene.creatives" :key="item.creativeId">
							<view class="warp">
								<view class="box" @click="sheetDetails(item.creativeId)">
									<image :src="item.uiElement.image.imageUrl" mode="aspectFit"></image>
									<view>
										<i class="iconfont iconicon--">{{ item.resources[0].resourceExtInfo.playCount | retainDoubleDigit }}</i>
									</view>
								</view>
								<view class="text">
									<text class="textitem">{{ item.uiElement.mainTitle.title }}</text>
								</view>
							</view>
						</view>
					</scroll-view>
				</view>
			</view>

			<!-- 新歌|新碟 -->
			<view class="recommendation newDisc" v-if="newSong != '' && newSong.creatives.length > 0">
				<view class="topTile">
					<view class="left">
						<view class="p">
							<text :class="clickFlag ? '' : 'active'" @click="clickFlag && changeFlag()">新歌</text>
							|
							<text :class="clickFlag ? 'active' : ''" @click="!clickFlag && changeFlag()">新碟</text>
						</view>
					</view>
					<view class="right">
						<view>
							<text v-if="!clickFlag" @click="openLatestMusic">更多新歌</text>
							<!-- <text v-else @click="openNewDisc()">更多新碟</text> -->
							<text v-else>更多新碟</text>
						</view>
					</view>
				</view>

				<view class="concentration">
					<swiper v-if="!clickFlag" class="swiper" :indicator-dots="false" :autoplay="true" :interval="8000" :duration="500" :circular="true">
						<swiper-item>
							<scroll-view class="scroll-view_H" scroll-x="true" scroll-left="120">
								<view
									class="scroll-view-item_H silde"
									v-for="(song, indexs) in newSong.creatives[1].resources"
									:key="indexs"
									@click="playMusic(song.resourceExtInfo.songData, song.uiElement.image.imageUrl)"
								>
									<view class="left"><image :src="song.uiElement.image.imageUrl" mode="aspectFit" /></view>
									<view class="center">
										<view>
											<text>{{ song.uiElement.mainTitle.title }}</text>

											<text>&nbsp;-&nbsp;{{ song.resourceExtInfo.artists[0].name }}</text>
										</view>
										<view>{{ song.uiElement.subTitle.title }}</view>
									</view>
									<view class="right">
										<view class="icon"><i class="iconfont iconbofang"></i></view>
									</view>
								</view>
							</scroll-view>
						</swiper-item>

						<swiper-item>
							<scroll-view class="scroll-view_H" scroll-x="true" scroll-left="120">
								<view
									class="scroll-view-item_H silde"
									v-for="(song, indexs) in newSong.creatives[0].resources"
									:key="indexs"
									@click="playMusic(song.resourceExtInfo.songData, song.uiElement.image.imageUrl)"
								>
									<view class="left"><image :src="song.uiElement.image.imageUrl" mode="aspectFit" /></view>
									<view class="center">
										<view>
											<text>{{ song.uiElement.mainTitle.title }}</text>

											<text>&nbsp;-&nbsp;{{ song.resourceExtInfo.artists[0].name }}</text>
										</view>
										<view>{{ song.uiElement.subTitle.title }}</view>
									</view>
									<view class="right">
										<view class="icon"><i class="iconfont iconbofang"></i></view>
									</view>
								</view>
							</scroll-view>
						</swiper-item>
					</swiper>

					<swiper v-if="clickFlag" class="swiper" :indicator-dots="false" :autoplay="true" :interval="8000" :duration="500" :circular="true">
						<swiper-item>
							<scroll-view class="scroll-view_H" scroll-x="true" scroll-left="120">
								<view class="scroll-view-item_H silde" v-for="(song, indexs) in newSong.creatives[3].resources" :key="indexs">
									<view class="left"><image :src="song.uiElement.image.imageUrl" mode="aspectFit" /></view>
									<view class="center">
										<view>
											<text>{{ song.uiElement.mainTitle.title }}</text>

											<text>&nbsp;-&nbsp;{{ song.resourceExtInfo.artists[0].name }}</text>
										</view>
										<view>{{ song.uiElement.subTitle.title }}</view>
									</view>
									<!-- <view class="right">
										<view class="icon"><i class="iconfont iconbofang"></i></view>
									</view> -->
								</view>
							</scroll-view>
						</swiper-item>

						<swiper-item>
							<scroll-view class="scroll-view_H" scroll-x="true" scroll-left="120">
								<view class="scroll-view-item_H silde" v-for="(song, indexs) in newSong.creatives[2].resources" :key="indexs">
									<view class="left"><image :src="song.uiElement.image.imageUrl" mode="aspectFit" /></view>
									<view class="center">
										<view>
											<text>{{ song.uiElement.mainTitle.title }}</text>

											<text>&nbsp;-&nbsp;{{ song.resourceExtInfo.artists[0].name }}</text>
										</view>
										<view>{{ song.uiElement.subTitle.title }}</view>
									</view>
									<!-- <view class="right">
										<view class="icon"><i class="iconfont iconbofang"></i></view>
									</view> -->
								</view>
							</scroll-view>
						</swiper-item>
					</swiper>
				</view>
			</view>
		</view>

		<!-- 抽屉 -->
		<uni-drawer :visible="true" :mask="true" :maskClick="true" mode="left" ref="draw" :width="240">
			<view class="content">
				<view class="lowerPart">
					<!-- 搜索框 -->
					<view class="search"><uni-search-bar @confirm="search" @input="input"></uni-search-bar></view>

					<!-- 用户信息 -->
					<view class="userProfile">
						<view class="top clearfix">
							<view class="left" @click="openMe()">
								<image :src="profile.avatarUrl" mode="aspectFill"></image>
								<text>{{ profile.nickname }}</text>
							</view>
							<view class="right">
								<view class="signIn" @click="dailySignin()">
									<i class="iconfont iconqiandao"></i>
									<text>{{ signIn }}</text>
								</view>
							</view>
						</view>
						<view class="bottomBar">
							<view>
								<i class="iconfont iconyoujian"></i>
								<text>我的消息</text>
							</view>
							<view>
								<i class="iconfont iconhaoyou"></i>
								<text>我的好友</text>
							</view>
							<view>
								<i class="iconfont iconzhuye"></i>
								<text>个人主页</text>
							</view>
							<view>
								<i class="iconfont iconquanmianshidai-"></i>
								<text>个性装扮</text>
							</view>
						</view>
					</view>

					<!--  -->
					<view class="ss"><button @click="clearStorage">clearStorage</button></view>
				</view>
			</view>
		</uni-drawer>

		<!-- 播放区 -->
		<music-playbar v-show="isShow"></music-playbar>
	</view>
</template>

<script>
import '@/static/less/index.less';
import uniGrid from '@/components/uni-grid/uni-grid.vue';
import uniGridItem from '@/components/uni-grid-item/uni-grid-item.vue';
import uniSearchBar from '@/components/uni-search-bar/uni-search-bar.vue';
import uniDrawer from '@/components/uni-drawer/uni-drawer.vue';
import musicPlaybar from '@/components/musicPlayBar/musicPlayBar.vue';
export default {
	components: { uniGrid, uniGridItem, uniSearchBar, uniDrawer, musicPlaybar },
	data() {
		return {
			day: '',
			signIn: '签到',
			profile: [], //用户信息
			swipeList: [], //轮播图list
			iconList: [], //首页-发现-圆形图标入口列表
			recommendedSongList: [], //推荐歌单
			personalTailor: [], //私人定制
			exclusiveScene: [], //专属场景歌单
			musicCalendar: [], //音乐日历
			newSong: [], //新歌新碟
			clickFlag: false, //判断是否为新歌栏
			headerPadding: '', //当前状态栏高度
			containerPaddingTop: '' //当前内容区距离顶部高度
		};
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
	onLoad() {
		this.headerPadding = uni.getSystemInfoSync()['statusBarHeight'] + 'px';
		this.containerPaddingTop = uni.getSystemInfoSync()['statusBarHeight'] - 25 + 149 + 'rpx';
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
		isPlay: {
			//播放状态
			get() {
				return this.$store.state.isPlay;
			},
			set(v) {
				// 使用vuex中的mutations中定义好的方法来改变
				this.$store.commit('setisPlay', v);
			}
		},
		songInfo: {
			//音乐信息
			get() {
				return this.$store.state.songInfo;
			},
			set(v) {
				// 使用vuex中的mutations中定义好的方法来改变
				this.$store.commit('setsongInfo', v);
			}
		},
		isDark: {
			//音乐信息
			get() {
				return this.$store.state.isDark;
			},
			set(v) {
				// 使用vuex中的mutations中定义好的方法来改变
				this.$store.commit('setisDark', v);
			}
		}
	},
	methods: {
		gethomedata: function() {
			//获取首页数据
			let that = this;
			uni.request({
				url: 'https://wx.3dcw.cn/homepage/block/page',
				method: 'GET',
				data: {
					refresh: true
					// t: Date.parse(new Date())
				},
				success(res) {
					console.log(res.data.data.blocks);
					that.swipeList = res.data.data.blocks[0].extInfo.banners;
					let temp = [['推荐歌单', '专属场景歌单', '音乐日历'], ['recommendedSongList', 'exclusiveScene', 'musicCalendar']];
					res.data.data.blocks
						.filter(item => {
							return item?.uiElement?.subTitle || item?.uiElement?.mainTitle;
						})
						.forEach(item => {
							let index = temp[0].findIndex(k => k == item.uiElement?.subTitle?.title || k == item.uiElement?.mainTitle?.title);
							if (index >= 0) {
								that[temp[1][index]] = item;
							}
							if (item.uiElement?.mainTitle?.title == '私人定制') {
								that.personalTailor = item;
							}
						});
					that.newSong = res.data.data.blocks.filter(item => {
						return item?.creatives?.[0]?.uiElement?.mainTitle?.title == '新歌';
					})[0];
					uni.hideLoading();
				},
				fail: err => {
					console.log(e);
				}
			});
		},
		geticon: function() {
			let that = this;
			uni.showLoading({
				title: '加载中...',
				mask: true
			});
			uni.request({
				url: 'https://wx.3dcw.cn/homepage/dragon/ball',
				method: 'GET',
				success(res) {
					let a = 0;
					for (let i = 0; i < res.data.data.length; i++) {
						switch (res.data.data[i].name) {
							case '每日推荐':
								that.iconList.push(res.data.data[i]);
								a++;
								break;
							case '歌单':
								that.iconList.push(res.data.data[i]);
								a++;
								break;
							case '排行榜':
								that.iconList.push(res.data.data[i]);
								a++;
								break;
							default:
								break;
						}
						if (a >= 3) {
							break;
						}
					}
					let increased = [];
					increased[0] = {
						iconUrl: '../../static/images/wode.png',
						name: '我的'
					};
					increased[1] = {
						iconUrl: '../../static/images/shipin.png',
						name: '视频'
					};
					that.iconList.push(increased[0]);
					that.iconList.push(increased[1]);
					that.gethomedata();
				}
			});
		},
		openDrawer: function() {
			this.$refs.draw.open();
		},
		closeDrawer: function() {
			this.leftdrawer = false;
		},
		playMusic: function(songinfos, songinfospicUrl) {
			console.log(songinfos);
			let songId = songinfos.id ? songinfos.id : songinfos.resourceId;
			songinfos['picUrl'] = songinfospicUrl;
			this.$store.commit('setisPlay', true);
			this.$store.commit('setsongInfo', songinfos);
			this.getplayMusic(songId, songinfos);
		},
		playMusicAll: function() {
			let that = this;
			let songAll = [];

			that.personalTailor.creatives.forEach(function(item) {
				item.resources.forEach(function(i) {
					let images = i.uiElement.image.imageUrl;
					i.picUrl = images;
					i.name = i.uiElement.mainTitle.title;
					songAll.push(i);
				});
			});
			that.$store.commit('setplaylist', songAll);
			that.$store.commit('setserialNumber', 0);
			that.getplayMusic(songAll[0].resourceId, songAll[0]);
		},
		clearStorage: function() {
			uni.clearStorage();
			uni.navigateTo({
				url: '/pages/login/login',
				animationType: 'pop-in',
				animationDuration: 200
			});
		},
		changeFlag: function() {
			//选择新歌|新碟
			this.clickFlag = !this.clickFlag;
		},
		middleMethods: function(index) {
			//根据index打开相应的方法
			switch (index) {
				case 0:
					uni.getStorage({
						key: 'profile',
						success(res) {
							uni.navigateTo({
								url: '/pages/dailyRecommendation/recommendation',
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

					break;
				case 1:
					uni.navigateTo({
						url: '/pages/songSheet/songSheet',
						success: function(res) {
							res.eventChannel.emit('songSheet', {
								songSheetType: '推荐'
							});
						},
						animationType: 'pop-in',
						animationDuration: 200
					});
					break;
				case 2:
					uni.navigateTo({
						url: '/pages/rankingList/rankingList',
						animationType: 'pop-in',
						animationDuration: 200
					});
					break;
				case 3:
					uni.getStorage({
						key: 'profile',
						success(res) {
							uni.navigateTo({
								url: '/pages/me/me',
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

					break;

				case 4:
					uni.getStorage({
						key: 'profile',
						success(res) {
							uni.navigateTo({
								url: '/pages/video/video',
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

					break;
			}
		},
		jumpSheet: function(sheet) {
			uni.navigateTo({
				url: '/pages/songSheet/songSheet',
				success: function(res) {
					res.eventChannel.emit('songSheet', {
						songSheetType: sheet
					});
				},
				animationType: 'pop-in',
				animationDuration: 200
			});
		},
		sheetDetails: function(sheetID) {
			// console.log(sheetID);

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
		openSearch: function() {
			uni.navigateTo({
				url: '/pages/search/search',
				animationType: 'pop-in',
				animationDuration: 200
			});
		},
		openMe: function() {
			uni.getStorage({
				key: 'profile',
				success(res) {
					uni.navigateTo({
						url: '/pages/me/me',
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
		openLatestMusic: function() {
			uni.getStorage({
				key: 'profile',
				success(res) {
					uni.navigateTo({
						url: '/pages/latestMusic/latestMusic',
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
		openNewDisc: function() {
			uni.getStorage({
				key: 'profile',
				success(res) {
					uni.navigateTo({
						url: '/pages/newDisc/newDisc',
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
		}
	},
	created() {
		this.geticon();
		let data = new Date();
		this.day = data.getDate() <= 9 ? '0' + data.getDate() : data.getDate();
		this.$store.commit('setisDark', false);
		console.log('isDark:', this.isDark);
	},
	beforeCreate() {
		let that = this;
		uni.getStorage({
			key: 'profile',
			success: function(res) {
				that.profile = res.data;
			},
			fail(err) {
				console.log(err);
				that.profile = {};
				that.profile['avatarUrl'] = 'https://www.3dcw.cn/image/wei.jpg';
				that.profile['nickname'] = '未登录';
			}
		});
	},
	onUnload() {
		this.$store.commit('setisPlay', false);
	}
};
</script>
<style lang="less">
page {
	--safe-area-inset-top: 0px;
	--safe-area-inset-right: 0px;
	--safe-area-inset-bottom: 0px;
	--safe-area-inset-left: 0px;
}

.topnavbar {
	position: fixed;
	z-index: 998;
	width: 100%;
	background-color: #fff;
	.status_bar {
		height: var(--status-bar-height);
		width: 100%;
	}
}
</style>
