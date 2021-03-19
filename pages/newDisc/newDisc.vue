<template>
	<view class="newDisc">
		<!-- 顶部导航栏 -->
		<view class="navbarSorll">
			<scroll-view scroll-x="true" :scroll-into-view="scrollLeft" scroll-left="0">
				<view :class="{ active: item.activity }" v-for="(item, index) in category" :key="index" :id="'text' + index" @click="getSelect(index, item.name)">
					<text>{{ item.name }}</text>
				</view>
			</scroll-view>
		</view>

		<!-- 内容区 -->
		<view class="contentArea">
			<hr-pull-load
				@refresh="refresh"
				@loadMore="loadMore"
				:height="-1"
				:pullHeight="50"
				:maxHeight="100"
				:lowerThreshold="200"
				:bottomTips="bottomTips"
				:isAllowPull="false"
				:isTab="false"
				ref="hrPullLoad"
			>
				<uni-grid :column="2" :show-border="false" :square="false">
					<uni-grid-item v-for="(item, index) in discList" :key="index">
						<view class="warp" v-if="item.type == 1" @click="openVideoDatails(item.data.vid)">
							
						</view>
					</uni-grid-item>
				</uni-grid>
			</hr-pull-load>
		</view>
	</view>
</template>

<script>
import '@/static/less/newDisc.less';
export default {
	data() {
		return {
			category: [
				{
					activity: true,
					area: 'ALL',
					name: '全部',
					imgSrc: 'https://www.3dcw.cn/image/d2a.jpg'
				},
				{
					activity: false,
					area: 'ZH',
					name: '华语',
					imgSrc: 'https://www.3dcw.cn/image/d28.jpg'
				},
				{
					activity: false,
					area: 'EA',
					name: '欧美',
					imgSrc: 'https://www.3dcw.cn/image/d27.jpg'
				},
				{
					activity: false,
					area: 'KR',
					name: '日本',
					imgSrc: 'https://www.3dcw.cn/image/d29.jpg'
				},
				{
					activity: false,
					area: 'KR',
					name: '韩国',
					imgSrc: 'https://www.3dcw.cn/image/d2_.jpg'
				}
			],
			bottomTips: '' ,//上拉状态标签
			cookie: '',
			page: 1,
			thisWeekdiscList:[]
		};
	},
	methods: {
		loadMore: function() {
			this.bottomTips = 'loading';
			this.getExampleData();
		},
		getExampleData: function() {
			let params = {},
				that = this;
			this.page++;
			params['id'] = that.videoGroupId;
			params['cookie'] = that.cookie;
			params['offset'] = (this.page - 1) * 21;
			params['t'] = Date.parse(new Date());

			uni.request({
				url: 'https://wx.3dcw.cn/video/group',
				data: params,
				success: function(res) {
					let temporary = that.videoList;
					let playlists = res.data.datas;
					that.videoList = [...temporary, ...playlists];
					that.bottomTips = '';
				},
				fail: function(err) {
					console.log(err);
					that.$refs.hrPullLoad.reSet();
					that.bottomTips = '';
				}
			});
		},
		getDiscList:function(cookie){
			uni.showLoading({
				mask:true,
				title:"加载中"
			})
			let that =this,area='';
			that.category.forEach(item => {
				if(item['activity']){
					area = item['area'];
				}
			});
			
			uni.request({
				url: 'https://wx.3dcw.cn/top/album',
				data: {
					limit:20,
					offset:(that.page-1)*20,
					area:area,
					type:"new",
					cookie:cookie
				},
				success: function(res) {
					console.log(res)
					that.thisWeekdiscList = res.data;
					uni.setStorage({
						key: 'discList',
						data: res.data
					});
					that.$refs.hrPullLoad.reSet();
					that.bottomTips = '';
					uni.hideLoading();
				},
				fail: function(err) {
					console.log(err);
					that.$refs.hrPullLoad.reSet();
					that.bottomTips = '';
					uni.hideLoading();
				}
			});
		}
	},
	created() {
		let that =this;
		uni.getStorage({
			key: 'cookie',
			success: function(res) {
				that.cookie = res.data;
				that.getDiscList(res.data);
			},
			fail: err => {
				console.log(err);
				uni.showToast({
					icon: 'none',
					title: '未登录，无法查看'
				});
		
				setTimeout(function() {
					uni.hideToast();
				}, 3000);
			}
		});
	}
};
</script>

<style></style>
