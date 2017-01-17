module.exports = {

	modelInReq: function(req){
		var t = url_service

		if(t.defined(req.options.params) && t.defined(req.options.params.model)){
			var modelName = req.options.params.model

			if(modelName in sails.models){
				if(t.defined(req.body) && t.defined(req.body.post)){
					if(modelName in req.body.post){
						return modelName
					}
					return false
				}
				return modelName
			}
			return false
		}

		return false

	},


	isPageInReq: function(req){
		var t = url_service

		if(t.defined(req.options.params.page) && req.options.params.page >= 0 && typeof parseInt(req.options.params.page) === 'number' && (req.options.params.page%1)===0){
			return true
		}
		return false
	},


	isOrmInReq: function(req){
		var t = url_service


		if(t.defined(req.options.params.orm)){
			var legal = []
			var ormObject = t.isJson(req.options.params.orm)
		

			if(ormObject){
				for(arg in ormObject){

					if(arg === 'sort'){
						var sortReq = ormObject.sort.split(' ')
						var sortedAttribute = sortReq[0]
						var sortOrder = sortReq[1]

						if(sortedAttribute in sails.models[req.options.params.model].attributes && (sortOrder === 'asc' || sortOrder === 'desc')){
							legal.push(true)
						}else{
							legal.push(false)
						}

					}else if(arg === 'where'){

						var whereObject = ormObject.where

						if(whereObject){
							for(attribute in whereObject){
								if(attribute in sails.models[req.options.params.model].attributes){
									legal.push(true)
								}else{
									legal.push(false)
								}
							}
						}else{
							legal.push(false)
						}
					}else{
						legal.push(false)
					}
				}	

			}else if(req.options.params.orm === '0'){
				ormObject = {}
				legal.push(true)
			}else{
				legal.push(false)
			}

			if(t.isLegalArray(legal)){
				//console.log(ormObject)
				return ormObject
			}else{
				return false
			}
		}else{
			return {}
		}
	},

	isRankInReq: function(req){
		var service = url_service

		if('rank' in req.options.params && service.defined(req.options.params.rank) && service.isStringStartingWithLetter(req.options.params.rank)){

			if(service.isExistingRank(req.options.params.rank)){
				return true
			}else{
				return false
			} 
		}else{
			return false
		}

	},

	isModelAttribute : function(model, attribute){
		if(attribute in sails.models[model].attributes){
			return true
		}
		return false
	},

	isExistingRank: function(rank){
		if(rank_service.getRankList().indexOf(rank) > -1){ // rank_service.getRankList might be asyncronous
			return true
		}else{
			return false
		}
	},

	isStringStartingWithLetter: function(string){
		if(isNaN(parseInt(string))){
			return true
		}
		return false
	},


	defined: function(object){
		if(typeof object != 'undefined' && object){
			return true
		}
		return false
	},

	isJson : function(supposedJson){

		try{
			var json = JSON.parse(supposedJson)
			return json

		}catch(e){
			return false
		}
	},

	isLegalArray: function(array){

		if(array.length > 0 && array.indexOf(false) === -1){
			return true
		}
		return false
	},
}

