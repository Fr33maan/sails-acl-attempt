module.exports = {

	isPrivate : function(modelName, actionName, attributeName){

		if(sails.models[modelName].crud_config[actionName].right_config[attributeName].right.privateAttr){
			return true
		}

		return false
	},

	reqIsOwner : function(req, modelName, modelObject){
		var Model = sails.models[modelName]
		var reqId = req_service.getId(req)
		var owner = false
		var Promise = require('promise')

		//console.log(reqId+'---'+modelObject.id)

		if(reqId === modelObject.id){
			return new Promise(function (resolve, reject){
				resolve(true)
			})
		}else{
			return Model.findOne({id : modelObject.id})
			.then(function (model){
				if(model && model.owner === reqId){
					return true
				}
				return false

			})
			.catch(function (err){
				log_service.recordError(err)
				return false
			})
		}
	},
}