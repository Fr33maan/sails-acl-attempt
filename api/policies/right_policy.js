module.exports = function(req, res, next){

  var actionName = req.options.action
  var rightArray = []
  var reqRank = rank_service.getRankInReq(req)
  var reqParams = req.options.params

  var askedRank
  var Promise = require('promise')
  //console.log(req.options.params)

  var whereInOrm = function(reqOptions){
    if(reqOptions.params.orm && 'where' in reqOptions.params.orm){
      return true
    }
    return false
  }


  var sortInOrm = function(reqOptions){
    if(reqOptions.params.orm && 'sort' in reqOptions.params.orm){
      return true
    }
    return false
  }

  new Promise(function (resolve, reject){

    if(actionName === 'read'){
      var modelName = reqParams.model
      var req_has_right_to_access_asked_rank = rank_service.firstIsAboveOrEqualSecond(reqRank.rank, reqParams.rank)
      var action =  sails.models[modelName].crud_config[actionName]

      //console.log(reqRank)

      if(req_has_right_to_access_asked_rank){

        //console.log(reqParams)

        askedRank = action.rightByRank[reqParams.rank]
        var massive = (reqParams.page != 0)
        var allowedAttrArray = massive ? askedRank.reqMany : askedRank.reqOne

        //console.log(allowedAttrArray)

        if(whereInOrm(req.options)){
          for(attribute in req.options.params.orm.where){
            if(allowedAttrArray.indexOf(attribute) === -1 && attribute != 'id'){
              reject(new Error(log_service.createStringError('user trying to use unauthorized attribute for a search', req)))
            }
          }
        }

        if(sortInOrm(req.options)){
          var attribute = req.options.params.orm.sort.split(' ')[0]
          if(allowedAttrArray.indexOf(attribute) === -1){
            reject(new Error(log_service.createStringError('user trying to use unauthorized attribute for sorting', req)))
          }
        }

        for(index in allowedAttrArray){
          var attribute = allowedAttrArray[index]
          var isPrivate = model_service.isPrivate(modelName, actionName, attribute)
          var isOp = rank_service.firstIsAboveOrEqualSecond(reqRank.rank, action.right_config[attribute].right.op)

          if(isPrivate && !isOp){
            return model_service.reqIsOwner(req, modelName, req.options.params.orm.where)
            .then(function (isOwner){
              if(!massive && (!isOwner && !isOp)){
                reject(new Error(log_service.createStringError('user trying to get non massive private data without being owner or op', req)))
              }else{
                resolve()
              }
            })
          }
        }
        
      }else{
        reject(new Error(log_service.createStringError('user has not enough rights for model '+modelName, req)))
      }

    }else{

      for(modelName in req.body){

        var action =  sails.models[modelName].crud_config[actionName]
        var rightByRank = action.rightByRank
        var number_of_model_type = Object.getOwnPropertyNames(req.body).length
        var number_of_objects_in_current_model = req.body[modelName].length

        if(reqRank.rank in rightByRank){
          var askedRank = rightByRank[reqRank.rank]

          for(i in req.body[modelName]){
            var modelObject = req.body[modelName][i]

            var massive = number_of_objects_in_current_model > 1
            var allowedAttrArray = massive ? askedRank.reqMany : askedRank.reqOne


            if(actionName === 'create'){
              if('id' in modelObject){
                reject(new Error(log_service.createStringError('user trying to create a '+modelName+' with an id', req)))
              }

              for(attribute in modelObject){
                if(allowedAttrArray.indexOf(attribute) === -1){
                  reject(new Error(log_service.createStringError('user trying to POST NON allowed attribute for model : '+modelName, req)))
                }
              }

            }else{
              if(!('id' in modelObject)){
                reject(new Error(log_service.createStringError('user trying to updating or destroying a model without giving an id', req)))
              }

              if(actionName === 'update'){
                for(attribute in modelObject){
                  if(allowedAttrArray.indexOf(attribute) == -1 && attribute != 'id'){
                    reject(new Error(log_service.createStringError('user trying to update unauthorized attribute', req)))
                  }

                  var isPrivate = model_service.isPrivate(modelName, actionName, attribute)
                  var isOp = rank_service.firstIsAboveOrEqualSecond(reqRank.rank, action.right_config[attribute].right.op)

                  if(isPrivate && !isOp){
                    return model_service.reqIsOwner(req, modelName, modelObject)
                    .then(function (isOwner){
                      if(!isOwner){
                        reject(new Error(log_service.createStringError('user trying to update private data without being owner', req)))
                      }else{
                        resolve()
                      }
                    })
                  }
                }
              }
            }
          }
        }else{
          reject(new Error(log_service.createStringError('user trying to bypass rank for model : '+modelName, req)))

        }
      }
    }
    
    resolve()

  })

.then(next)

.catch(function (Error){
  return res.forbidden(Error)
})

}