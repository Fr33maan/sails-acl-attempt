module.exports = {

	initConfig: function(){
		var t = right_service
		t.loadModelSecurityVar()

	},

	loadModelSecurityVar : function(){
		var t = right_service

		for(model in sails.models){
			//console.log(model)
			if(!(model.match(/_/g))){
				var Model = sails.models[model]

				for(actionName in Model.crud_config){

					t.setDefaultSecurity(Model, actionName)
					t.setAskabkeRanks(Model, actionName)
					t.setAskableAttributeList(Model, actionName)
					t.setClosestRank(Model, actionName)

				}
			}
		}
	},



	setDefaultSecurity : function(Model, actionName){
		for(attribute in Model.attributes){
			if(!(attribute in Model.crud_config[actionName].right_config)){
				Model.crud_config[actionName].right_config[attribute] = {}
				Model.crud_config[actionName].right_config[attribute].right = {}
				Model.crud_config[actionName].right_config[attribute].right.rank = rank_service.getHighestRank()
			}
		}
	},


	setAskabkeRanks : function(Model, actionName){

		var ranksObject = {}
		var rankArray = []
		var right_config = Model.crud_config[actionName].right_config

		for(attribute in right_config){

			var right = right_config[attribute].right

			for(setting in right){
				if(setting === 'rank' || setting === 'op'){

					var rankName = right[setting]
					var rankIndex = rank_service.getRankIndex(rankName)

					if(!(rankName in ranksObject) && rankIndex != rank_service.getHighestIndex()){
						rankArray.push(rankName)
						ranksObject[rankName] = {rank : rankName, index : rankIndex}
					}
				}
			}
		}


		var leng = Object.getOwnPropertyNames(ranksObject).length


		if(leng === 0){
			rankArray.push(rank_service.getHighestRank())
			ranksObject[rank_service.getHighestRank()] = {rank : rank_service.getHighestRank(), index : rank_service.getHighestIndex()}
		}

		Model.crud_config[actionName].rightByRank = ranksObject
		Model.crud_config[actionName].lowestAskableRank = rank_service.get_lowest_rank_in_array(rankArray)

	},




	setAskableAttributeList : function(Model, actionName){

		var ranksObject = Model.crud_config[actionName].rightByRank

		for(rankName in ranksObject){
			var rankObject = ranksObject[rankName]

			rankObject.reqOne = []
			rankObject.reqMany = []

			for(attribute in Model.crud_config[actionName].right_config){
				var right = Model.crud_config[actionName].right_config[attribute].right

				if(!(attribute in Model.attributes)){
					console.log('attribute '+attribute+' does NOT exists for model : '+Model.identity)
				}

				if('rank' in right){
					if(rank_service.getRankIndex(right.rank) <= rankObject.index){
						if('privateAttr' in right && right.privateAttr){

							if(rank_service.getRankIndex(right.rank) === rankObject.index){
								rankObject.reqOne.push(attribute)

							}

							if('op' in right && (rank_service.getRankIndex(right.op) <= rankObject.index)){
								rankObject.reqOne.push(attribute)
								rankObject.reqMany.push(attribute)
							}
						}else{
							rankObject.reqOne.push(attribute)
							rankObject.reqMany.push(attribute)
						}
					}
				}
			}

				//console.log('model : '+model+' --- rank : '+rankObject.rank)
				//console.log(rankObject.reqOne)
			//console.log(rankObject.reqMany)
		}
		//console.log(Model.crud_config[actionName].rightByRank)
	},


	setClosestRank : function(Model, actionName){

		var rankList = rank_service.getRankList()

		for(rankIndex in rankList){
			var rankNameService = rankList[rankIndex]
			var ranksObject = Model.crud_config[actionName].rightByRank


			if(!(rankNameService in ranksObject)){
				for(var i = rankIndex; i>0; i--){
					if(rankList[i-1] in ranksObject){
						ranksObject[rankList[rankIndex]] = ranksObject[rankList[i-1]]
						break
					}
				}
			}
		}
	},
}