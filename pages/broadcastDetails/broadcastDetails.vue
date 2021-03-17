<template>
	<view class="broadcastDetails">
		<view class="topnavbar">
			<view class="status_bar" :style="{ height: headerPadding }"></view>
			<uni-nav-bar left-icon="back" @click-left="back()" background-color="transparent" :border="false" color="#FFFFFF">
				<view class="narBarTitle">{{ songInfo.name }}</view>
			</uni-nav-bar>
		</view>

		<view class="details">
			<view class="orientation" v-if="!showLyric" @click="showLyricFun">
				<image v-if="!isPlay" class="play" src="../../static/images/play.png" mode="aspectFit"></image>
				<image v-else class="pause" src="../../static/images/playAuto.png" mode="aspectFit"></image>
				<image class="disk" src="../../static/images/disk.png" mode="aspectFit"></image>
				<image class="songimg" :src="songInfo.picUrl" mode="aspectFit"></image>
			</view>
			<view class="lyric" v-else @click="showLyricFun">
				<bing-lyric :lyrics="currentLyric" :curTime="lyricsCurTime" :areaStyle="cuAreaStyle" @centerBtnClick="centerBtnClick" @copyLyrics="copy"></bing-lyric>
			</view>
			<view class="operation">
				<view class="tool">
					<i class="iconfont iconshoucang"></i>
					<i class="iconfont iconxiazai"></i>
					<i class="iconfont iconktv"></i>
					<i class="iconfont iconpinglun"></i>
					<i class="iconfont icongengduo2"></i>
				</view>
				<view class="progress">
					<dc-slider :value="sliderValue" max="100"></dc-slider>
					<text class="start">{{ songCurrentTime | formatDateTime(this) }}</text>
					<text class="end">{{ songDuration | formatDateTime(this) }}</text>
				</view>
				<view class="roadcast">
					<i class="iconfont iconliebiaoxunhuan"></i>
					<i class="iconfont iconshangyishoushangyige" @click="lastSongs()"></i>
					<i v-if="!isPlay" class="iconfont iconbofang1" @click="playMusic()"></i>
					<i v-if="isPlay" class="iconfont iconzanting" @click="pauseAudio()"></i>
					<i class="iconfont iconxiayigexiayishou" @click="nextSongs()"></i>
					<i class="iconfont iconbofangliebiao"></i>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import '@/static/less/broadcastDetails.less';
import DcSlider from '@/components/ly-drag-slider/dc-slider.vue';
import bingLyric from '@/components/bing-lyric/bing-lyric.vue';
export default {
	components: { DcSlider, bingLyric },
	data() {
		return {
			headerPadding: '',
			percentage: 0,
			currentTimes: 0,
			durations: 0,
			currentLyric: [],
			currentLineNum: 0,
			playingLyric: '',
			sliderValue: '', //进度条当前进度
			cuAreaStyle: {
				width: '100%'
			},
			lyricsCurTime: 0 //当前歌词进度
		};
	},
	onLoad() {
		this.headerPadding = uni.getSystemInfoSync()['statusBarHeight'] + 'px';
	},
	filters: {
		//拦截器
		formatDateTime: function(data, that) {
			return that.formatMilliseconds(data);
		}
	},
	computed: {
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
		songDuration: {
			//音频长度信息
			get() {
				return this.$store.state.songDuration;
			},
			set(v) {
				// 使用vuex中的mutations中定义好的方法来改变
				this.$store.commit('setsongDuration', v);
			}
		},
		songCurrentTime: {
			//当前播放位置信息
			get() {
				return this.$store.state.songCurrentTime;
			},
			set(v) {
				// 使用vuex中的mutations中定义好的方法来改变
				this.$store.commit('setsongCurrentTime', v);
			}
		},
		playlist: {
			//播放列表信息
			get() {
				return this.$store.state.playlist;
			},
			set(v) {
				// 使用vuex中的mutations中定义好的方法来改变
				this.$store.commit('setplaylist', v);
			}
		},
		serialNumber: {
			//播放列表信息
			get() {
				return this.$store.state.serialNumber;
			},
			set(v) {
				// 使用vuex中的mutations中定义好的方法来改变
				this.$store.commit('setserialNumber', v);
			}
		},
		showLyric: {
			//显示歌词
			get() {
				return this.$store.state.showLyric;
			},
			set(v) {
				// 使用vuex中的mutations中定义好的方法来改变
				this.$store.commit('setshowLyric', v);
			}
		}
	},
	methods: {
		back: function() {
			uni.navigateBack({
				delta: 1
			});
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
		},
		getCurrentTime: function() {
			this.playCurrentTime();
			let that = this;
			setTimeout(function() {}, 300);
			that.sliderValue = ((that.songCurrentTime / that.songDuration).toFixed(2) * 100).toFixed(0);
			// console.log('进度：' + that.sliderValue);
			if (this.isPlay) {
				setTimeout(function() {
					that.getCurrentTime();
				}, 500);
			}
		},
		playMusic: function() {
			this.playAudio();
			this.isPlay = true;
			this.getCurrentTime();
		},
		nextSongs: function() {
			this.nextSong(this.serialNumber, this.playlist);
			this.getCurrentTime();
		},
		lastSongs: function() {
			this.lastSong(this.serialNumber, this.playlist);
			this.getCurrentTime();
		},
		getlyric: function() {
			// 根据音乐id获取歌词
			let that = this;
			uni.getStorage({
				key: 'cookie',
				success: cookieRes => {
					uni.request({
						url: 'https://wx.3dcw.cn/lyric',
						data: {
							id: this.songInfo.id ? this.songInfo.id : this.songInfo.resourceId,
							cookie: cookieRes.data
						},
						success: function(res) {
							// console.log('详细歌词信息格式化：',JSON.stringify(res.data) );

							if (res.data.lrc) {
								that.currentLyric = res.data.lrc.lyric.split('\n');
							} else {
								that.currentLyric = [];
							}

							console.log('详细歌词信息格式化：', that.currentLyric);
						},
						fail: err => {
							console.log(err);
						}
					});
				}
			});
		},
		showLyricFun: function() {
			this.showLyric ? this.$store.commit('setshowLyric', false) : this.$store.commit('setshowLyric', true);
		}
	},
	watch: {
		songInfo: function() {
			this.getlyric();
		},
		songCurrentTime: function() {
			this.lyricsCurTime = (this.songCurrentTime / 1000).toFixed(0);
		}
	},

	created() {
		this.getlyric();
		let audioUrl = this.getAudioUrl();
		console.log('sss', audioUrl);
		let that = this;
		let innerAudioContext = '';
		if (!audioUrl) {
			innerAudioContext = uni.createInnerAudioContext();
			innerAudioContext.src = this.$store.getters.getsongPlayUrl;
			innerAudioContext.autoplay = false;
			innerAudioContext.onCanplay(function(res) {
				console.log('innerAudioContext 1:', innerAudioContext.duration);
				that.$store.commit('setsongDuration', innerAudioContext.duration * 1000);

				setTimeout(() => {
					console.log('innerAudioContext 2:', innerAudioContext.duration);
					that.$store.commit('setsongCurrentTime', 0);
					this.sliderValue = 0;
					that.$store.commit('setsongDuration', innerAudioContext.duration * 1000);
				}, 200);
			});

			setTimeout(function() {
				innerAudioContext.destroy();
			}, 1000);
		} else {
			this.sliderValue = ((that.songCurrentTime / that.songDuration).toFixed(2) * 100).toFixed(0);
			this.lyricsCurTime = (this.songCurrentTime / 1000).toFixed(0);
			console.log('歌词进度：', this.lyricsCurTime);
		}
	}
};
</script>
