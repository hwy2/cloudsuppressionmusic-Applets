import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
const store = new Vuex.Store({
	state: {
		songPlayUrl: '', //音乐播放链接
		playlist: '', //播放列表
		songInfo: '', //音乐信息
		isPlay: false, //是否播放音乐
		serialNumber: 0, //播放列表序号
		isShow: false, //显示播放栏
		songDuration: "00:00", //音频长度
		songCurrentTime: '00:00', //播放当前进度
		showLyric: false,//显示歌词
		isDark:true,//黑夜模式
		
	},
	getters: {
		getsongInfo(state) {
			return state.songInfo;
		},
		getsongPlayUrl(state) {
			return state.songPlayUrl;
		},
		getplaylist(state) {
			return state.playlist;
		},
		getisPlay(state) {
			return state.isPlay;
		},
		getserialNumber(state) {
			return state.serialNumber;
		},
		getisShow(state) {
			return state.isShow;
		},
		getsongDuration(state) {
			return state.songDuration;
		},
		getsongCurrentTime(state) {
			return state.songCurrentTime;
		},
		getshowLyric(state) {
			return state.showLyric;
		},
		getisDark(state) {
			return state.isDark;
		}
	},
	mutations: {
		setsongInfo(state, status) {
			state.songInfo = status;
			uni.setStorageSync("store", state)
		},
		setsongPlayUrl(state, status) {
			state.songPlayUrl = status;
			uni.setStorageSync("store", state)
		},
		setplaylist(state, status) {
			state.playlist = status;
			uni.setStorageSync("store", state)
		},
		setisPlay(state, status) {
			state.isPlay = status;
			uni.setStorageSync("store", state)
		},
		setserialNumber(state, status) {
			state.serialNumber = status;
			uni.setStorageSync("store", state)
		},
		setisShow(state, status) {
			state.isShow = status;
			uni.setStorageSync("store", state)
		},
		setsongDuration(state, status) {
			state.songDuration = status;
			uni.setStorageSync("store", state)
		},
		setsongCurrentTime(state, status) {
			state.songCurrentTime = status;
			uni.setStorageSync("store", state)
		},
		setshowLyric(state, status) {
			state.showLyric = status;
			uni.setStorageSync("store", state)
		},
		setisDark(state, status) {
			state.isDark = status;
			uni.setStorageSync("store", state)
		}
	},
	actions: {},
})

export default store
