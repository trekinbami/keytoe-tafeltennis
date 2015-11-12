Meteor.publish("matches", function(){
	return Matches.find();
});

Meteor.publish("rankings", function(){
	return Rankings.find();
});


Meteor.methods({
	addMatch: function(homePlayer, homeScore, awayPlayer, awayScore, pointsToAdd, winner){
		Matches.insert({
			homePlayer: homePlayer,
			homeScore: homeScore,
			awayPlayer: awayPlayer,
			awayScore: awayScore,
			pointsToAdd: pointsToAdd,
			winner: winner,
			date: new Date()
		});
	},
	removeMatch: function(id){
		Matches.remove(id);
	},
	updateRanking: function(valId, newPos){
		Rankings.update(
			{_id: valId},
			{$set: {position: newPos}}
		);
	},
	incrementPoints: function(id, pointsToAdd){
		Rankings.update(
			{_id: id},
			{$inc: {points: pointsToAdd}}
		);
	},
	decrementPoints: function(id, pointsToAdd){
		Rankings.update(
			{_id: id},
			{$inc: {points: -pointsToAdd}}
		);
	}
});
