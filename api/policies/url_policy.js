
module.exports = function(req, res, next){

	var Promise = require('promise')
	var service = url_service
	var model = service.modelInReq(req)


	new Promise(function (resolve, reject){

		if(req.options.action === 'read'){

			if(!model){
				return reject(new Error(log_service.createStringError('asked model in req.params is not an existant model', req)))
			}

			var lowestAskableRank = sails.models[model].crud_config.read.lowestAskableRank
			var rightByRank = sails.models[model].crud_config.read.rightByRank
			var ormInReq = service.isOrmInReq(req)

			if(!(service.isPageInReq(req))){
				return reject(new Error(log_service.createStringError('no page defined', req)))
			}


			if(!ormInReq){
				return reject(new Error(log_service.createStringError('no valid orm in req', req)))

			}else{
				if(typeof req.options.params.orm === undefined && req.options.params.rank){
					return reject(new Error(log_service.createStringError("orm can't be undefined if rank is defined", req)))

				}

				req.options.params.orm = ormInReq
			}


			var ormLength = Object.getOwnPropertyNames(ormInReq).length

			if(req.options.params.page === '0' && ormLength === 0){
				return reject(new Error(log_service.createStringError("can't ask page 0 if orm is not valid or undefined", req)))

			}

			if(!(service.isRankInReq(req)) || !(req.options.params.rank in rightByRank)){
				if(lowestAskableRank){
					req.options.params.rank = lowestAskableRank
				}
			}

			return resolve()		

		}else{

			if('body' in req){
				for(model in req.body){
					if(!(model in sails.models)){
						return reject(new Error(log_service.createStringError(sails.config.errorMsg.url_policy.inexistantModel+model, req)))

					}
				}
			}
			resolve()
		}		

	})
	//indent
	.then(next)
	.catch(function (Error){
		return res.forbidden(Error)
	})
}