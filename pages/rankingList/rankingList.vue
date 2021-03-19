<template>
	<view class="rankingList">
		<view class="listDetail">
			<!-- 榜单推荐 -->
			<view class="listRecommendation">
				<view class="top"><text>榜单推荐</text></view>

				<uni-grid :column="3" :show-border="false" :square="false">
					<uni-grid-item v-for="(item, index) in listRecommendation" :key="index" >
						<view class="image" @click="oprankingDetails(item.id)">
							<image :src="item.coverImgUrl" mode=""></image>
							<text>{{ item.updateFrequency }}</text>
						</view>
						<view class="text">
							<text>{{ item.name }}</text>
						</view>
					</uni-grid-item>
				</uni-grid>
			</view>

			<!-- 官方榜 -->
			<view class="officialList" v-if=" officialList != '' && officialList.length > 0">
				<view class="top"><text>官方榜</text></view>
				<scroll-view scroll-y="true">
					<view class="scroll-item" v-for="(item, index) in officialList" :key="index" @click="oprankingDetails(item.id)">
						<view class="left"  >
							<image :src="item.coverImgUrl" mode=""></image>
							<text>{{ item.updateFrequency }}</text>
						</view>
						<view class="right">
							<text v-for="(warp, indexs) in item.tracks" :key="indexs">{{ warp.first }}-{{ warp.second }}</text>
						</view>
					</view>
				</scroll-view>
			</view>

			<!-- 特色榜 -->
			<view class="featureList" v-if=" featureList != '' && featureList.length > 0">
				<view class="top"><text>特色榜</text></view>
				<uni-grid :column="3" :show-border="false" :square="false">
					<uni-grid-item v-for="(item, index) in featureList" :key="index">
						<view class="image"  @click="oprankingDetails(item.id)">
							<image :src="item.coverImgUrl" mode=""></image>
							<text>{{ item.updateFrequency }}</text>
						</view>
						<view class="text">
							<text>{{ item.name }}</text>
						</view>
					</uni-grid-item>
				</uni-grid>
			</view>

			<!-- 全球榜 -->
			<view class="globalList"  v-if=" globalList != '' && globalList.length > 0">
				<view class="top"><text>全球榜</text></view>
				<uni-grid :column="3" :show-border="false" :square="false">
					<uni-grid-item v-for="(item, index) in globalList" :key="index">
						<view class="image"  @click="oprankingDetails(item.id)">
							<image :src="item.coverImgUrl" mode=""></image>
							<text>{{ item.updateFrequency }}</text>
						</view>
						<view class="text">
							<text>{{ item.name }}</text>
						</view>
					</uni-grid-item>
				</uni-grid>
			</view>

			<!-- 地区榜 -->
			<view class="regionalList" v-if=" regionalList != '' && regionalList.length > 0">
				<view class="top"><text>地区榜</text></view>
				<uni-grid :column="3" :show-border="false" :square="false">
					<uni-grid-item v-for="(item, index) in regionalList" :key="index">
						<view class="image"  @click="oprankingDetails(item.id)">
							<image :src="item.coverImgUrl" mode=""></image>
							<text>{{ item.updateFrequency }}</text>
						</view>
						<view class="text">
							<text>{{ item.name }}</text>
						</view>
					</uni-grid-item>
				</uni-grid>
			</view>

			<!-- 曲风榜 -->
			<view class="musicStyleList">
				<view class="top"><text>曲风榜</text></view>
				<uni-grid :column="3" :show-border="false" :square="false">
					<uni-grid-item v-for="(item, index) in musicStyleList" :key="index">
						<view class="image"  @click="oprankingDetails(item.id)">
							<image :src="item.coverImgUrl" mode=""></image>
							<text>{{ item.updateFrequency }}</text>
						</view>
						<view class="text">
							<text>{{ item.name }}</text>
						</view>
					</uni-grid-item>
				</uni-grid>
			</view>
		</view>

		<!-- 播放区 -->
		<music-playbar v-show="isShow"></music-playbar>
	</view>
</template>

<script>
import '@/static/less/rankingList.less';
import musicPlaybar from '@/components/musicPlayBar/musicPlayBar.vue';
import uniGrid from '@/components/uni-grid/uni-grid.vue';
import uniGridItem from '@/components/uni-grid-item/uni-grid-item.vue';
export default {
	components: { musicPlaybar, uniGrid, uniGridItem },
	data() {
		return {
			allList: [], //全部榜单
			listRecommendation: [], //榜单推荐
			officialList: [], //官方榜
			featureList: [], //特色榜
			globalList: [], //全球榜
			regionalList: [], //地区榜
			musicStyleList: [], //曲风榜
			songListId: '' //歌单id
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
		getToplist: function() {
			let that = this;
			uni.showLoading({
				title: '加载中...',
				mask: true
			});

			uni.request({
				url: 'https://wx.3dcw.cn/toplist/detail',
				method: 'GET',
				success: function(res) {
					console.log(res.data)
					res.data.list.forEach(item => {
						//官方榜
						if (item.ToplistType) {
							that.officialList.push(item);
						}

						// 推荐榜
						if (item.name === '硬地原创音乐榜') {
							that.listRecommendation.push(item);
						}
						if (item.name === 'iTunes榜') {
							that.listRecommendation.push(item);
						}
						if (item.name === '云音乐欧美热歌榜') {
							that.listRecommendation.push(item);
						}

						// 特色榜
						if (item.name === '抖音排行榜') {
							that.featureList.push(item);
						}
						if (item.name === '云音乐古典音乐榜') {
							that.featureList.push(item);
						}
						if (item.name === '云音乐达人榜') {
							that.featureList.push(item);
						}

						// 全球榜
						if (item.name === '美国Billboard榜') {
							that.globalList.push(item);
						}
						if (item.name === 'UK排行榜周榜') {
							that.globalList.push(item);
						}
						if (item.name === 'iTunes榜') {
							that.globalList.push(item);
						}
						if (item.name === '日本Oricon榜') {
							that.globalList.push(item);
						}
						if (item.name === '法国 NRJ Vos Hits 周榜') {
							that.globalList.push(item);
						}
						if (item.name === '云音乐欧美新歌榜') {
							that.globalList.push(item);
						}

						// 地区榜
						if (item.name === '云音乐欧美热歌榜') {
							that.regionalList.push(item);
						}
						if (item.name === '云音乐日语榜') {
							that.regionalList.push(item);
						}
						if (item.name === '云音乐韩语榜') {
							that.regionalList.push(item);
						}

						// 曲风榜
						if (item.name === '云音乐电音榜') {
							that.musicStyleList.push(item);
						}
						if (item.name === '云音乐ACG榜') {
							that.musicStyleList.push(item);
						}
						if (item.name === '云音乐民谣榜') {
							that.musicStyleList.push(item);
						}
						if (item.name === '云音乐说唱榜') {
							that.musicStyleList.push(item);
						}
						if (item.name === '云音乐摇滚榜') {
							that.musicStyleList.push(item);
						}
						if (item.name === '云音乐古风榜') {
							that.musicStyleList.push(item);
						}
					});

					uni.hideLoading();
				},
				fail: function(err) {
					console.log(err);
				}
			});
		}
		,oprankingDetails:function(sheetID){
			
			uni.getStorage({
				key: 'profile',
				success(res) {
					uni.navigateTo({
						url: '/pages/rankingDetails/rankingDetails',
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
		}
	},
	created() {
		this.getToplist();
	}
};
</script>

<style></style>
