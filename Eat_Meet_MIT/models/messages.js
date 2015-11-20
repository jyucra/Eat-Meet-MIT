var mongoose = require("mongoose");
var Conversation = require("./conversations");
var User = require("./users");

var messageSchema = mongoose.Schema({
	_id: Number,
	author: {type: Number, ref: 'User'},
	receiver: {type: Number, ref: 'User'},
	content: String,
	timestamp: Number
});



/**
* get conversationID with input of user_send_id, user_receive_id
* 
*  @param user_send_id : user_id who sent the message
*  @param user_receive_id : user_id who receives the message
*
*/ 
var findConvserationID = function(user_send_id, user_receive_id, callback){
	User.findOne({_id:user_send_id}, function(err,results){
		if (err){
			callback(err)
		}
		else{

		var conversationID = results.network.filter( function(obj){
            if(obj[0]===user_receive_id){
              return true;
            }else{
              return false;}
            })[1];
		callback(conversationID);
		}
	});
};


/**
* create_message with input of user_send_id, user_receive_id
* 
*  @param user_send_id : user_id who sent the message
*  @param user_receive_id : user_id who receives the message
*  @param content : message content
*
*/ 
messageSchema.statics.createMessage = function(user_send_id, user_receive_id, content, callback){
	//step 1 get the new_id 
	this.find({}, function(err, results){
		var new_message_id = results.length;

		if(new_message_id>=0){
			var new_message = {
				_id: new_message_id,
				author: user_send_id,
				receiver: user_receive_id,
				content: content
			}
			this.create(new_message, function(err,results_add){
          //console.log(results_add);
          		callback(null);
        	});

	 //step 2 find the current conversation_id and push message_id into conversation 
	    	findConvserationID(user_send_id, user_receive_id, function(conversation_id){
	    		if(conversation_id){
	    			Conversation.findOne({_id:conversation_id},function(err,results){
	    				if(err) {
	    					callback(err);
	    				}
	    				else{
	    					results.messages.push(new_message_id);
	    					Conversation.findOneAndUpdate({_id:conversation_id}, {messages:results.messages}, function(err2,results){
	    						if(err2){
	    							callback({msg:"update message_id error"});
	    						}
	    						else{
	    							callback(null);
	    						}
	    					});
	    				}

	    			});
	    		}
	    		else{
	    			callback({msg:"in valid converation_id"});
	    		}
	    	});
		}
		else{
			callback({msg:"invalid new_message_id"});
		}
	})
};




var Message = mongoose.model('Message', userSchema);
module.exports = Message;