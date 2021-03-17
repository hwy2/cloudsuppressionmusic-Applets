<template>
	<!-- #ifndef APP-PLUS-NVUE -->
	<view class="progress-box" :style="{height: blockSize + 'rpx'}" @tap="handleTapFn">
		<view class="readers-slider" :style="{height: lineSize + 'rpx'}">
			<view
				class="readers-slider__value"
				:style="{
					width: posVal + '%',
					backgroundColor: activeColor
				}"
			>
				<view
					class="rid-box"
					:style="{
						width: blockSize + 'rpx',
						height: blockSize + 'rpx',
						backgroundColor: blockOuterColor
					}"
					@touchstart="touchS"
					@touchmove="touchM"
					@touchend="touchE"
				>
					<view
						:style="{
							width: blockSize/2 + 'rpx',
							height: blockSize/2 + 'rpx',
							backgroundColor: blockColor
						}"
						class="dist"
					></view>
				</view>
			</view>
		</view>
	</view>
	<!-- #endif -->
	<!-- #ifdef APP-PLUS-NVUE -->
	<view
		class="progress-box"
		@touchstart="touchS"
		@touchmove="touchM"
		@touchend="touchE"
		@tap="handleTapWeex"
		:style="{ height: blockSize + 'rpx', paddingLeft: blockSize / 2 + 'rpx', paddingRight: blockSize / 2 + 'rpx' }"
	>
		<view class="readers-slider reaSlider" ref="reaSlider" :style="{ height: lineSize + 'rpx' }">
			<view
				class="readers-slider__value"
				:style="{
					width: widthPx + 'px',
					backgroundColor: activeColor
				}"
			></view>
		</view>
		<view
			class="rid-box"
			ref="ridbox"
			:style="{
				width: blockSize + 'rpx',
				height: blockSize + 'rpx',
				backgroundColor: blockOuterColor,
				transform: 'translateX(' + widthPx + 'px)'
			}"
		>
			<view
				:style="{
					width: blockSize / 2 + 'rpx',
					height: blockSize / 2 + 'rpx',
					backgroundColor: blockColor
				}"
				class="dist"
			></view>
		</view>
	</view>
	<!-- #endif -->
</template>

<script>
let sdilderPos = {};
let sliderWidth = 0;
let sliderLeft = 0;
let dragVal = 0;
// #ifdef APP-PLUS-NVUE
const dom = weex.requireModule('dom');
// #endif
export default {
	name: 'dc-slider',
	props: {
		value: {
			default: 0,
			type: Number
		},
		disabled: {
			type: Boolean,
			default: false
		},
		activeColor: {
			type: String,
			default: '#00E3AB'
		},
		min: {
			default: 0,
			type: Number
		},
		max: {
			default: 100,
			type: Number
		},
		step: {
			default: 1,
			type: Number
		},
		lineSize: {
			type: Number,
			default: 4
		},
		blockSize: {
			type: Number,
			default: 32
		},
		//内块颜色
		blockColor: {
			type: String,
			default: '#00e3ab'
		},
		//外圈颜色
		blockOuterColor:{
			type: String,
			default: 'rgba(0, 227, 171, 0.2)'
		}
	},
	watch: {
		value: {
			//监听进度值变化
			handler(val) {
				if (this.moveLock) {
					return false;
				}
				let _v = val > this.min ? val : this.min;
				this.posVal = ((_v - this.min) * 100) / (this.max - this.min);
			},
			immediate: true
		}
	},
	
	computed: {
		// #ifdef APP-PLUS-NVUE
		widthPx() {
			let _width = (this.sliderWidth * this.posVal) / 100;
			if (_width > this.sliderWidth) {
				_width = this.sliderWidth;
			}
			return _width;
		},
		//#endif
	},
	data() {
		return {
			posVal: 0, //进度条值
			defVal: 0,
			moveLock: false ,//操作锁，双向绑定音频进度拖动操作可用（ps可以自己监听更改重置）
			sliderWidth:0
		};
	},
	mounted() {
		console.log(this.blockColor.indexOf('#'))
		//#ifndef APP-PLUS-NVUE
		const query = uni.createSelectorQuery().in(this);
		query
			.select('.readers-slider')
			.boundingClientRect(data => {
				// console.log(data);
				sliderWidth = data.width;
				sliderLeft = data.left;
			})
			.exec();
		//#endif
		//#ifdef APP-PLUS-NVUE
		setTimeout(() => {
			const result = dom.getComponentRect(this.$refs.reaSlider, option => {
				console.log('PLUS-NVUE:getComponentRect:', option);
				sliderWidth = option.size.width;
				sliderLeft = option.size.left;
				this.sliderWidth = option.size.width
			});
		}, 300);
		//#endif
	},
	methods: {
		//点击进度条跳到进度位置
		handleTapFn(e) {
			if (this.disabled) return;
			this.moveLock = true;
			let page_x = e.detail.x?e.detail.x:e.detail.pageX;
			let Pos_v = ((page_x - sliderLeft) / sliderWidth) * 100;
			let val = Math.round(Pos_v);
			if (val > 100) {
				this.defVal = 100;
			} else if (val < 0) {
				this.defVal = 0;
			} else {
				let r = (100 / (this.max - this.min)) * this.step;
				let v = Math.round(val / r) * r;
				this.defVal = v;
			}
			let d = this.max - this.min;
			dragVal = Math.round(((d * this.defVal) / 100 + this.min) * 100) / 100;
			this.posVal = Math.round(this.defVal);
			this.$emit('changed', { progress: this.posVal, value: dragVal });
			setTimeout(() => {
				this.moveLock = false;
			}, 1000);
		},
		handleTapWeex() {//APP-PLUS-NVUE
			if (this.disabled) return;
			this.moveLock = true;
			let m = sdilderPos.touchE;
			let page_x = m.pageX;
			let Pos_v = ((page_x) / sliderWidth) * 100;
			let val = Math.round(Pos_v);
			if (val > 100) {
				this.defVal = 100;
			} else if (val < 0) {
				this.defVal = 0;
			} else {
				let r = (100 / (this.max - this.min)) * this.step;
				let v = Math.round(val / r) * r;
				this.defVal = v;
			}
			let d = this.max - this.min;
			dragVal = Math.round(((d * this.defVal) / 100 + this.min) * 100) / 100;
			this.posVal = Math.round(this.defVal);
			this.$emit('changed', { progress: this.posVal, value: dragVal });
			setTimeout(() => {
				this.moveLock = false;
			}, 1000);
		},
		touchS(e) {
			if (this.disabled) return;
			this.moveLock = true;
			let s = e.changedTouches[0];
			sdilderPos.touchS = s;
			sdilderPos.touchS.val = this.posVal;
		},
		touchM(e) {
			if (this.disabled) return;
			let m = e.changedTouches[0];
			let Pos_v = Number(sdilderPos.touchS.val) + ((m.pageX - sdilderPos.touchS.pageX) / sliderWidth) * 100;
			let val = Math.round(Pos_v);
			if (val > 100) {
				this.defVal = 100;
			} else if (val < 0) {
				this.defVal = 0;
			} else {
				let r = (100 / (this.max - this.min)) * this.step;
				let v = Math.round(val / r) * r;
				this.defVal = v;
			}
			var d = this.max - this.min;
			dragVal = Math.round(((d * this.defVal) / 100 + this.min) * 100) / 100;
			this.posVal = Math.round(this.defVal);
			this.$emit('changing', { progress: this.posVal, value: dragVal });
		},
		touchE(e) {
			if (this.disabled) return;
			this.$emit('changed', { progress: this.posVal, value: dragVal });
			let s = e.changedTouches[0];
			sdilderPos.touchE = s;
			setTimeout(() => {
				this.moveLock = false;
			}, 1000);
		}
	}
};
</script>
<style>
/* #ifdef APP-PLUS-NVUE */
.progress-box {
	height: 32rpx;
	position: relative;
	display: flex;
	align-items: center;
	flex-direction: row;
}
.readers-slider {
	background-color: #d8d8d8;
	border-radius: 2px;
	width: 100%;
	display: flex;
	flex: 1;
	flex-direction: row;
	align-items: center;
	position: relative;
}
.readers-slider__value {
	background-color: #00e3ab;
	height: 100%;
	position: relative;
	font-size: 0;
	align-items: center;
}
.dist {
	background-color: #00e3ab;
	height: 16rpx;
	width: 16rpx;
	border-radius: 50%;
}
.rid-box {
	background-color: rgba(0, 227, 171, 0.2);
	height: 32rpx;
	width: 32rpx;
	border-radius: 50%;
	position: absolute;
	left: 0;
	top: 0;
	align-items: center;
	justify-content: center;
}
/*  #endif  */
</style>

<style lang="stylus" scoped>
/* #ifndef APP-PLUS-NVUE */
.progress-box
	width 100%
	min-width 200rpx
	height 32rpx
	position relative
	display flex
	align-items center
	.readers-slider
		background #D8D8D8
		border-radius 2px
		width 100%
		height 2px
		.readers-slider__value
			background #00E3AB
			height 100%
			position relative
			font-size 0
			.dist
				background #00E3AB
				display inline-block
				height 16rpx
				width 16rpx
				border-radius 50%
				position absolute
				right 50%
				top 50%
				transform translate(50%, -50%)
			.rid-box
				background rgba(0, 227, 171, 0.2)
				height 32rpx
				width 32rpx
				border-radius 50%
				position absolute
				right 0
				top 50%
				transform translate(50%, -50%)
/*  #endif  */
</style>


