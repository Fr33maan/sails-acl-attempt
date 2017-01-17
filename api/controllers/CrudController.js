/**
 * CrudController
 *
 * @description :: Server-side logic for managing cruds
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

 module.exports = {


 	read : function(req, res){
 		
 		crud_service.read(req)
 		.then(function (models){
 			//console.log(models)
 			res.json({success : models})
 		})
 		.catch(log_service.error_log)

 	},

 	create : function(req, res){

 		crud_service.create(req)
 		.then(function (models){
 			res.json({models : models})
 		})
 		.catch(log_service.error_log)

 	},

 	update : function(req, res){
 		crud_service.update(req)
 		.then(function (models){
 			res.json({models : models})
 		})
 		.catch(log_service.error_log)
 	},

 	destroy : function(req, res){
 		crud_service.destroy(req)
 		.then(function (){
 			res.json({msg : 'objects destroyed'})
 		})
 		.catch(log_service.error_log)
 	},
 };

