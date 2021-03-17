<template>
	<view class="playBar">
		<view class="left">
			<view class="musicImg">
				<view class="package"><image :src="songInfo.picUrl" mode="aspectFit"></image></view>
			</view>

			<view class="details" @click="broadcast()">
				<text>{{ songInfo.name }}</text>
				<text v-if="songInfo.ar">{{ songInfo.ar[0].name }}</text>
				<text v-if="songInfo.artists">{{ songInfo.artists[0].name }}</text>
				<text v-if="songInfo.resourceExtInfo">{{ songInfo.resourceExtInfo.artists[0].name }}</text>
			</view>
		</view>
		<view class="right">
			<i class="iconfont icontubiaozhizuomoban" @click="playAudio()" v-if="!isPlay"></i>
			<i class="iconfont icontubiaozhizuomoban1" @click="pauseAudio()" v-if="isPlay"></i>
			<i class="iconfont iconbofangliebiao"></i>
		</view>
	</view>
</template>

<script>
export default {
	name: 'PalyBar',
	data() {
		return {};
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
		songPlayUrl: {
			//歌曲URL
			get() {
				return this.$store.state.songPlayUrl;
			},
			set(v) {
				this.$store.commit('setsongPlayUrl', v);
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
		}
	},
	methods: {
		broadcast:function(){
			uni.navigateTo({
				url: '/pages/broadcastDetails/broadcastDetails',
				animationType: 'pop-in',
				animationDuration: 200
			});
		}
	},
	// watch: {
	// 	isPlay: function(newV) {
	// 		console.log('变化'+newV);
	// 		if (newV) {
	// 			this.playAudio();
	// 		} else {
	// 			this.pauseAudio();
	// 		}
	// 	}
	// },
	created() {
	}
};
</script>

<style lang="scss">
.playBar {
	position: fixed;
	bottom: 0;
	bottom: constant(safe-area-inset-bottom); /* 兼容 iOS < 11.2 */
	bottom: env(safe-area-inset-bottom); /* 兼容 iOS >= 11.2 */
	z-index: 998;
	height: 108upx;
	width: 100%;
	display: flex;
	border-top: 1px solid #f0f0f0;
	background-color: #fff;

	.left {
		flex: 8;
		height: 100%;
		box-sizing: border-box;
		padding-left: 10upx;
		display: flex;

		.musicImg {
			flex: 1.5;
			width: 80upx;
			height: 100%;
			position: relative;

			view {
				width: 80upx;
				height: 80upx;
				display: inline-block;
				background-color: #eee;
				border-radius: 80upx;
				box-sizing: border-box;
				position: absolute;
				top: 50%;
				left: 15upx;
				transform: translateY(-50%);

				image {
					width: 100%;
					height: 100%;
					border-radius: 80upx;
				}
			}
		}

		.details {
			flex: 6;
			height: 100%;
			box-sizing: border-box;
			padding-top: 8upx;
			padding-left: 10upx;

			text:nth-of-type(1) {
				display: block;
				line-height: 1.8;
				font-size: 26upx;
				font-weight: bold;
				color: #000;
				width: 408upx;
				overflow: hidden; //隐藏文字
				text-overflow: ellipsis; //显示...
				white-space: nowrap; //不换行
			}

			text:nth-of-type(2) {
				line-height: 1.8;
				font-size: 24upx;
				color: #828282;
			}
		}
	}

	.right {
		flex: 2;
		height: 100%;
		padding-right: 22upx;
		box-sizing: border-box;
		display: flex;

		.icontubiaozhizuomoban,
		.icontubiaozhizuomoban1 {
			font-size: 48upx;
			line-height: 106upx;
			padding-right: 38upx;
			flex: 1;
		}

		.icontubiaozhizuomoban1 {
			color: red;
		}

		.iconbofangliebiao {
			font-size: 44upx;
			line-height: 106upx;
			flex: 1;
		}
	}
}
</style>
