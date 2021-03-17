<template>
	<view class="login">
		<!-- 欢迎语 -->
		<view class="topProfile">
			<view class="portrait">
				<image src="../../static/images/logo.png" mode="aspectFit"></image>
				<view class="vr_wrap"></view>
				<view class="vr_wrap2"></view>
			</view>
			<view class="welcome">
				<!-- 		<text>Welcome back!</text>
				<text>Sign in to account</text> -->
			</view>
		</view>

		<!-- 登录表单 -->
		<view class="forms">
			<form>
				<view class="row">
					<view class="phone">
						<input type="text" value="" name="phone" v-model="userPhone" placeholder="网易云音乐账号" />
						<i class="iconfont iconzhanghao"></i>
					</view>
				</view>
				<view class="row">
					<view class="password">
						<input type="password" value="" name="password" v-model="userPassword" placeholder="密码" />
						<i class="iconfont iconmima"></i>
					</view>
					<!-- <i class="iconfont iconzhuce" ><text>注册</text></i> -->
				</view>
				<view class="row"><button type="button" @click="login()">Sign in</button></view>
				<uni-popup ref="popup" type="message"><uni-popup-message type="success" :message="loginmessage" :duration="2000"></uni-popup-message></uni-popup>
			</form>
		</view>
	</view>
</template>

<script>
import '../../static/less/login.less';
import uniPopup from '@/components/uni-popup/uni-popup.vue';
import uniPopupMessage from '@/components/uni-popup-message/uni-popup-message.vue';
export default {
	components: {
		uniPopup,
		uniPopupMessage
	},
	data() {
		return {
			userPhone: '', //手机号
			userPassword: '', //密码
			loginmessage: '' //提示内容
		};
	},
	methods: {
		login: function() {
			//登录验证
			let that = this;
			if (this.userPhone == '' || this.userPassword == '') {
				this.loginmessage = '账号密码不能为空';
				this.openMessage();
				throw new Error('请填写手机号码与密码');
			} else if (this.userPhone.length < 11) {
				this.loginmessage = '手机号不能小于11位';
				this.openMessage();
				throw new Error('手机号不能小于11位');
			}
			uni.request({
				url: 'https://wx.3dcw.cn/login/cellphone', //手机登录接口。
				data: {
					phone: this.userPhone,
					password: this.userPassword
				},
				method: 'POST',
				success: res => {
					console.log(res.data);
					if (res.data.code === 200) {
						that.playbackRecord(res.data.profile);
						that.$store.commit('setisPlay', false);
						that.$store.commit('setisShow', true);
						uni.setStorage({
							key: 'cookie',
							data: res.data.cookie
						});
						uni.setStorage({
							key: 'profile',
							data: res.data.profile,
							success: function(res) {
								that.loginmessage = '登录成功';
								that.openMessage();
								uni.showToast({
									mask: true,
									icon: 'none',
									title: '登录成功'
								});
								setTimeout(function() {
									uni.navigateTo({
										url: '/pages/index/index',
										animationType: 'pop-out',
										animationDuration: 200
									});
								}, 500);
							}
						});
					} else {
						this.loginmessage = res.data.message;
						this.openMessage();
					}
				},
				fail: err => {
					console.log('失败:' + JSON.stringify(err));
					this.loginmessage = '服务器错误';
					this.openMessage();
				}
			});
		},
		openMessage: function() {
			this.$refs.popup.open();
		},
		playbackRecord: function(profile) {
			let that = this;
			uni.request({
				url: 'https://wx.3dcw.cn/user/record',
				method: 'GET',
				data: {
					uid: profile.userId,
					type: 1,
					t: Date.parse(new Date())
				},
				success(res) {
					console.log('播放记录', res.data);
					res.data.weekData[0].song['picUrl'] = res.data.weekData[0].song.al.picUrl;
					that.$store.commit('setsongInfo', res.data.weekData[0].song);
					that.getMusicUrl(res.data.weekData[0].song.id);
				}
			});
		},
		getMusicUrl: function(songId) {
			let that = this;
			uni.request({
				url: 'https://wx.3dcw.cn/song/url',
				method: 'GET',
				data: {
					id: songId,
					t: Date.parse(new Date())
				},
				success(res) {
					that.$store.commit('setsongPlayUrl', res.data.data[0].url);
					uni.setStorage({
						key: 'store',
						data: that.$store.state
					});
				}
			});
		}
	}
};
</script>

<style></style>
