<script>
export default {
	onLaunch: function() {
		console.log('App Launch');
	},
	onShow: function() {
		console.log('App Show');
		this.getAudioStatus();
		let that = this;
		uni.getStorage({
			key: 'store',
			success(storeRes) {
				that.$store.replaceState(Object.assign({}, that.$store.state, storeRes.data));
				that.$store.commit('setisPlay', false);
				let songinfos = storeRes.data.songInfo;
				let songId = songinfos.id ? songinfos.id : songinfos.resourceId;
				uni.request({
					url: 'https://wx.3dcw.cn/song/url',
					method: 'GET',
					data: {
						id: songId,
						t: Date.parse(new Date())
					},
					success(res) {
						if (res.data.data[0].url != null) {
							console.log('更新音乐url');
							that.$store.commit('setsongPlayUrl', res.data.data[0].url);
							that.initAudioContext(res.data.data[0].url,storeRes.data.songInfo,false);
						}
					},
					fail(err) {
						that.$store.commit('setisPlay', false);
						console.log('歌曲URL获取失败！', err);
					}
				});
			}
		});
	},
	onHide: function() {
		console.log('App Hide');
	}
};
</script>

<style>
/*每个页面公共css */
@import url('/static/iconFont/iconfont.css');
@import url('/components/uni.css');
@import url('/static/less/public.less');
</style>
