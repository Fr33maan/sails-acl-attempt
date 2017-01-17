module.exports = {
	ranklist : [],

	getRankList: function(){
		var t = rank_service

		if(t.ranklist.length === 0){

			t.ranklist = [
			'guest',
			'user',
			'moderator',
			'staff',
			'webadmin',
			'root'
			]

		}
		return t.ranklist


	},


	rankExists: function(rankName){

		var t = rank_service

		if(t.getRankList().indexOf(rankName) > -1){
			return true
		}
		return false
	},


	get_lowest_rank_in_array : function(array){

		var t = rank_service.getRankIndex

		array.sort(function (a, b){
			if(t(a) > t(b)){
				return 1
			}else if(t(a) < t(b)){
				return -1
			}
			return 0
		})

		return array[0]
	},


	getHighestRank: function(){
		var t = rank_service

		return t.getRankList()[t.getRankList().length-1]
	},

	getHighestIndex: function(){
		var t = rank_service

		return t.getRankList().length-1
	},

	getRankIndex: function(rankName){
		var t = rank_service
		var index = t.getRankList().indexOf(rankName)

		return index > -1 ? index : false
	},

	firstIsAboveOrEqualSecond : function(rank1, rank2){
		var t = rank_service.getRankIndex
		return t(rank1) >= t(rank2)
	},

	getRankInReq : function(req){
		var t = rank_service

		if(req.isAuthenticated()){
			return {rank : req.user[0].rank, index : t.getRankIndex(req.user[0].rank)}
		}else{
			return {rank : t.getRankList()[0], index : 0}
		}
	},

	isReqAllowed : function(req, askedRank){
		var t = rank_service
		return t.getRankInReq(req).index >= t.getRankIndex(askedRank)
	},

}
