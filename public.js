import Vue from 'vue'

import store from './store'
Vue.prototype.$store = store;


let that = "";
let bgAudioMannager = uni.getBackgroundAudioManager(); //音频api

// init audio组件实例化
Vue.prototype.initAudioContext = function(url, songInfo, isPlay) {
	that = this;
	bgAudioMannager.title = songInfo.name;
	if (songInfo.ar) {
		bgAudioMannager.singer = songInfo.ar[0].name;
	} else if (songInfo.artists) {
		bgAudioMannager.singer = songInfo.artists[0].name;
	} else if (songInfo.resourceExtInfo) {
		bgAudioMannager.singer = songInfo.resourceExtInfo.artists[0].name;
	} else {
		bgAudioMannager.singer = "暂无";
	}
	bgAudioMannager.coverImgUrl = songInfo.picUrl;
	this.$store.commit('setsongPlayUrl', url);
	if (isPlay) {
		bgAudioMannager.play();
	} else {
		setTimeout(() => {
			bgAudioMannager.pause();
		}, 30)
	}
}

// 获取音乐是否可以播放并获取相应的播放url
Vue.prototype.getplayMusic = function(songinfoId, songinfo) {
	// 根据id查看是否有权限播放
	let that = this,
		Wxcookie = "";

	// 获取cookie
	uni.getStorage({
		key: "cookie",
		success: function(res) {
			Wxcookie = res.data;

			// 检测音乐是否可以播放
			uni.request({
				url: "https://wx.3dcw.cn/check/music",
				method: 'GET',
				header: {
					"cookie": Wxcookie
				},
				data: {
					id: songinfoId,
					t: Date.parse(new Date())
				},
				success(res) {
					console.log("音乐是否可用", res.data);
					if (res.data.success) {
						// 获取音乐的url
						uni.hideLoading()
						that.getsongUrl(Wxcookie, songinfoId, songinfo);
					} else {

						uni.showToast({
							icon: "none",
							title: '亲爱的,暂无版权，已为你播放下一首'
						});

						setTimeout(function() {
							uni.hideLoading();
						}, 3000);
						that.nextSong(that.$store.getters.getserialNumber, that.$store.getters.getplaylist);
					}
				},
				fail(err) {
					console.log(err)
				}
			})
		},
		fail: function(err) {
			console.log(err);
			uni.showToast({
				icon: "none",
				title: "未登录无法播放"
			})

			setTimeout(function() {
				uni.hideToast()
			}, 3000);
		}
	})
}

// 获取播放url
Vue.prototype.getsongUrl = function(Wxcookie, songinfoId, songinfo) {
	let that = this;
	uni.request({
		url: "https://wx.3dcw.cn/song/url",
		method: 'GET',
		header: {
			"cookie": Wxcookie
		},
		data: {
			id: songinfoId,
			t: Date.parse(new Date())
		},
		success(res) {
			if (res.data.data[0].url != null) {
				console.log("歌曲详情：", res.data);
				that.$store.commit("setsongInfo", songinfo);
				that.$store.commit("setsongPlayUrl", res.data.data[0].url);
				that.initAudioContext(res.data.data[0].url, songinfo, true);
				// 播放音乐
				that.playAudio();
				that.$store.commit("setisPlay", true);
			} else {

				uni.showToast({
					icon: "none",
					title: '亲爱的,暂无版权，已为你播放下一首'
				});

				setTimeout(function() {
					uni.hideLoading();
				}, 3000);

				that.nextSong(that.$store.getters.getserialNumber, that.$store.getters.getplaylist);
			}
		},
		fail(err) {
			that.$store.commit("setisPlay", false);
			console.log("歌曲URL获取失败！", err);
		}
	})
}

// 下一首
Vue.prototype.nextSong = function(number, songlist) {
	if (songlist.length > 1 && number < songlist.length - 1) {
		this.$store.commit("setserialNumber", number + 1);
		if (!songlist[number + 1].picUrl) {
			if(songlist[number + 1].al){
				songlist[number + 1]["picUrl"] = songlist[number + 1].al.picUrl;
			}else if(songlist[number + 1].album){
				songlist[number + 1]["picUrl"] = songlist[number + 1].album.picUrl;
			}
		}
		this.getplayMusic(songlist[number + 1].id ? songlist[number + 1].id : songlist[number + 1].resourceId, songlist[
			number + 1]);
	} else {
		this.$store.commit("setisPlay", false);
		uni.showToast({
			icon: "none",
			title: '列表已播放完'
		});

		setTimeout(function() {
			uni.hideLoading();
		}, 3000);
	}
}

// 上一首
Vue.prototype.lastSong = function(number, songlist) {
	if (songlist.length > 1 && number < songlist.length - 1 && number != 0) {
		this.$store.commit("setserialNumber", number - 1);
		// songlist[number - 1]["picUrl"] = songlist[number - 1].al.picUrl;
		if (!songlist[number - 1].picUrl) {
			if(songlist[number - 1].al){
				songlist[number - 1]["picUrl"] = songlist[number - 1].al.picUrl;
			}else if(songlist[number - 1].album){
				songlist[number - 1]["picUrl"] = songlist[number - 1].album.picUrl;
			}
		}
		this.getplayMusic(songlist[number + 1].id ? songlist[number + 1].id : songlist[number + 1].resourceId, songlist[number - 1]);
	} else {
		// this.$store.commit("setisPlay", false);
		if (number == 0) {

			uni.showToast({
				icon: "none",
				title: '这是第一首哦！'
			});
		} else {
			this.$store.commit("setisPlay", false);

			uni.showToast({
				icon: "none",
				title: '列表已播放完！'
			});
		}

	}
}

// 播放
Vue.prototype.playAudio = function() {
	console.log("播放")
	this.$store.commit('setisPlay', true);

	if (bgAudioMannager.src) {
		if(bgAudioMannager.src!=this.$store.getters.getsongPlayUrl){
			bgAudioMannager.src = this.$store.getters.getsongPlayUrl;
		}else{
			bgAudioMannager.play();
		}
	} else {
		bgAudioMannager.src = this.$store.getters.getsongPlayUrl;
	}
}

// 跳转到指定位置
Vue.prototype.jumpSeek = function(time){
	bgAudioMannager.seek(time/1000)
}

// 暂停
Vue.prototype.pauseAudio = function() {
	console.log("暂停")
	bgAudioMannager.autoplay = false;
	this.$store.commit('setisPlay', false);
	bgAudioMannager.pause();
}

Vue.prototype.playCurrentTime = function() {
	// console.log("当前播放进度：" +bgAudioMannager.currentTime*1000);
	that.$store.commit("setsongCurrentTime", bgAudioMannager.currentTime* 1000);
}


// 音频自然播放结束事件
bgAudioMannager.onEnded(function() {
	that.nextSong(that.$store.getters.getserialNumber, that.$store.getters.getplaylist);
	that.$store.commit("setisPlay", false);
})

// 音频播放错误事件
bgAudioMannager.onError(function(res) {
	console.log(res.errMsg);
	console.log(res.errCode);
	that.$store.commit("setisPlay", false);
	uni.showToast({
		icon: "none",
		title: '格式错误'
	});
})

// 音频进入可以播放状态
bgAudioMannager.onCanplay(function(res) {
	console.log("timelong 1:", bgAudioMannager.duration)
	that.$store.commit("setsongDuration", bgAudioMannager.duration * 1000);

	setTimeout(() => {
		console.log("timelong 2:", bgAudioMannager.duration)
		that.$store.commit("setsongDuration", bgAudioMannager.duration * 1000);
	}, 200)
})

// 音频数据不足
bgAudioMannager.onWaiting(function(res) {
	console.log(res);
})

bgAudioMannager.onPrev(function(){
	this.lastSong(this.$store.getters.getserialNumber,this.$store.getters.getplaylist);
})

bgAudioMannager.onNext(function(){
	this.nextSong(this.$store.getters.getserialNumber,this.$store.getters.getplaylist);
})

Vue.prototype.getAudioStatus = function() {

	uni.showToast({
		icon: "none",
		title: bgAudioMannager.paused
	});

	console.log("背景音乐当前状态", bgAudioMannager.paused)

}


Vue.prototype.getAudioUrl = function() {
	console.log("url:",bgAudioMannager.src)
	if(bgAudioMannager.src){
		return 1;
	}else{
		return 0;
	}
	
}