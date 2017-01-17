module.exports = function(req, res, next){

	req.options.params = {}

	for(param in req.params){
		req.options.params[param] = req.params[param]
	}

	next()

}