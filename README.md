# sails-acl-attempt

### configure ACL :
- **api/models/User.js** : exemple of how to use ACL
- **api/models/Log.js** : exemple of how to use url redirect ACL

### How it works :

##### Policies
This code has been written around 1000 days before I write this. I globally remember what it does but I don't know how.  
There is some policies that filter requests : url_policy and right_policy.  

##### Services
Then services will send you the information you have access to:
- crud_service will send the results of the requests and cache it for next same level request
- right_service is used by policies -> it is initialized in config/bootstrap.js

##### Config
- see routes.js
