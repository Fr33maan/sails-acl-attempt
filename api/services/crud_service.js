module.exports = {

	read : function(req){

		var cache = require('memory-cache')
		var Promise = require('promise')
		var resLimitSize = sails.config.globals.resLimitSize
		var stringreq = ''
		var dbreq = {}
		var modelName = req.options.params.model
		var page = req.options.params.page
		var orm = req.options.params.orm
		var rank = req.options.params.rank
		var massive = (page != 0)
		var cacheUrl = modelName+'/'
		var cacheValidity = sails.models[modelName].cacheValidity 


		return new Promise(function (resolve, reject){
			if(massive){
				dbreq.limit = page * Math.round(resLimitSize / sails.models[modelName].crud_config.read.size)
				dbreq.skip = dbreq.limit * (page - 1)
			}

			if(orm){
				if(orm.where){
					dbreq.where = orm.where
				}

				if(orm.sort){
					dbreq.sort = orm.sort
				}
			}

			cacheUrl = JSON.stringify(dbreq)

			if(rank){
				cacheUrl += '/'+rank
			}

			cacheUrl.replace(/ /g, '') //remove all whitespaces

			//console.log(cacheUrl)

			if(cache.get(cacheUrl)){
				resolve(cache.get(cacheUrl))

			}else{
				sails.models[modelName].find(dbreq).then(function (models){
					models.map(function (model){
						for(attribute in model){
							var reqNumber = massive ? 'reqMany' : 'reqOne'
							var allowedAttributeArray = sails.models[modelName].crud_config.read.rightByRank[rank][reqNumber]

							if(allowedAttributeArray.indexOf(attribute) === -1 ){
								delete model[attribute]
							}
						}
					})

					cache.put(cacheUrl, models, cacheValidity)
					resolve(models)
				})
			}
		})
		//indent
	},



	create : function(req){
		var Promise = require('promise')
		var async = require('async')
		var arr = []
		var objects = []

		return new Promise(function (resolve, reject){

			for(model in req.body){
				for(i in req.body[model]){
					(function (model ,i){
						arr.push(function (cb){
							sails.models[model].create(req.body[model][i]).then(function (obj){
								objects.push(obj)
								cb()
							}).catch(log_service.error_log)
						})
					})(model, i)
				}
			}

			async.parallel(arr, function (){
				resolve(objects)
			})
		})
	},

	update : function(req){
		var Promise = require('promise')
		var async = require('async')
		var clone = require('clone')
		var arr = []
		var objects = []

		return new Promise(function (resolve, reject){

			for(model in req.body){
				for(i in req.body[model]){
					(function (model ,i){
						arr.push(function (cb){
							var obj = req.body[model][i]
							var id = clone(req.body[model][i].id)
							delete obj.id

							sails.models[model].update({id : id}, obj).then(function (object){
								objects.push(object[0])
								cb()
							}).catch(cb)
						})
					})(model, i)
				}
			}

			async.parallel(arr, function (){
				resolve(objects)
			})
		})
	},

	destroy : function(req){
		var Promise = require('promise')
		var async = require('async')
		var arr = []

		return new Promise(function (resolve, reject){

			for(model in req.body){
				for(i in req.body[model]){
					(function (model ,i){
						arr.push(function (cb){
							var obj = req.body[model][i]

							sails.models[model].destroy({id : id}).then(cb).catch(cb)
						})
					})(model, i)
				}
			}

			async.parallel(arr, function (){
				resolve()
			})
		})
	}
}


