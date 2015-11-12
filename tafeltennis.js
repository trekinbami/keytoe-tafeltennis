// Matches = new Mongo.Collection('matches');
// Rankings = new Mongo.Collection('rankings');
// Pages = new Meteor.Pagination(Matches, {  
// 	itemTemplate: "match",
// 	route: "/items/",
// 	router: "iron-router",
// 	routerTemplate: "Items",
// 	routerLayout: "Layout",
// 	divWrapper: false,
// 	sort: { date: -1 },
// 	templateName: "Items",
// 	availableSettings: {
// 		sort: true, 
// 		filters: true
// 	}
// });

// function fetchActivePlayers(){
// 	var playerlist = Rankings.find().fetch(),
// 		activePlayers = [];

// 	$.each(playerlist, function(index, value){
// 		if( value.active === "active" ){
// 			var player = {position: index, player: value.player};
// 			activePlayers.push(player);
// 		}
// 	});

// 	return activePlayers;
// }

// function updateRanking(oldRanking){
// 	var rankingObj = Rankings.find({active: 'active'}).fetch(), 
// 		newScores = [], 
// 		changedPlayer = {},
// 		goesUp = false;

// 	$.each(rankingObj, function(index, value){
// 		if( value.points !== oldRanking[index].points){
// 			changedPlayer = {newpoints: value.points, oldposition: oldRanking[index].position};
			
// 			if( value.points > oldRanking[index].points){
// 				goesUp = true;
// 			}	
// 		}

// 		var score = {points: value.points, player: value.player};
// 		newScores.push(score);
// 	});

// 	newScores.sort(function(a,b){
// 		if (a.points < b.points){ return 1; }
//   		if (a.points > b.points){ return -1;}
//   		return 0;
// 	});

// 	$.each(newScores, function(index, value){
// 		if( value.points === changedPlayer.newpoints ){
// 			changedPlayer.newposition = index+1;
// 			return false;
// 		}
// 	});

// 	var topPosition;
// 	if( goesUp === true ){
// 		topPosition = Rankings.find({position: {$gte: changedPlayer.newposition, $lt: changedPlayer.oldposition}}).fetch();
// 	}	else{
// 		topPosition = Rankings.find({position: {$gt: changedPlayer.oldposition, $lte: changedPlayer.newposition}}).fetch();
// 	}

// 	$.each(topPosition, function(index, value){	
// 		var newRanking;
// 		if( goesUp === true){
// 			newRanking = (value.position+1);
// 		}	else{
// 			newRanking = (value.position-1);
// 		}

// 		Meteor.call("updateRanking", value._id, newRanking);
// 	});

// 	$.each(newScores, function(index, value){
// 		if( value.points === changedPlayer.newpoints ){
// 			var playerObj = Rankings.findOne({player: value.player}),
// 				newRanking = index+1;

// 			Meteor.call("updateRanking", playerObj._id, newRanking);
// 		}	
// 	});
// }

// function awardPoints(winner, loser){
// 	var pointList = [{position: 1, points: 14},{position: 2, points: 10},{position: 3, points: 8},{position: 4, points: 6},{position: 5, points: 4},{position: 6, points: 3},{position: 7, points: 2}];

// 	var loserObj = Rankings.findOne({player: loser}),
// 		loserPosition = loserObj.position,
// 		pointsToAdd = 1;

// 	$.each(pointList, function(index, value){
// 		if( value.position === loserPosition ){
// 			pointsToAdd = value.points;
// 		}
// 	});

// 	return pointsToAdd;
// }

// if (Meteor.isClient) {

// 	Meteor.subscribe("matches");
// 	Meteor.subscribe("rankings");

// 	Template.body.helpers({
// 		activePlayers: function(){
// 			return fetchActivePlayers();
// 		},
// 		ranking: function(){
// 			return Rankings.find({active: "active"}, {sort: {position: 1}});
// 		}
// 	});


// 	Template.registerHelper("prettifyDate", function(date) {	
// 		var d = date.getDate(),
// 			m = (date.getMonth() + 1),
// 			y = date.getFullYear(),
// 			y = date.getFullYear(),
// 			hrs = date.getHours(),
// 			min = ('0'+date.getMinutes()).slice(-2);

// 		return d+'-'+m+'-'+y+' '+hrs+':'+min;
// 	});

// 	Template.body.events({
// 		'click .add-match': function(event){
// 			event.preventDefault();

// 			var homePlayer = $('#playerOne option:selected').val(),
// 				homeScore = $('#scoreOne option:selected').val(),
// 				awayPlayer = $('#playerTwo option:selected').val(),
// 				awayScore = $('#scoreTwo option:selected').val();


// 			//winner bepalen
// 			var winner, loser;
			
// 			if( homeScore > awayScore ){
// 				winner = homePlayer;
// 				loser = awayPlayer;
// 			}	else{
// 				winner = awayPlayer;
// 				loser = homePlayer;
// 			}

// 			//ranking updaten
// 			var pointsToAdd = awardPoints(winner, loser);

// 			Meteor.call("addMatch", homePlayer, homeScore, awayPlayer, awayScore, pointsToAdd, winner);

// 			//array maken met oude scores
// 			var oldRanking = Rankings.find({active: 'active'}).fetch();

// 			//winnnaar punten geven
// 			var playerObj = Rankings.findOne({player: winner});

// 			//punten tellen
// 			Meteor.call("incrementPoints", playerObj._id, pointsToAdd);

// 			//ranking updaten
// 			updateRanking(oldRanking);
// 		},

// 		'change select': function(event){
// 			var opt_text = $(event.target).find('option:selected').text();
// 			$(event.target)
// 				.parent()
// 				.find('.mock-std')
// 				.text(opt_text);
// 		},

// 		'change .filter-player': function(event){
// 			var filterPlayer = $(event.target).find('option:selected').text();
// 			Session.set('filterPerson', filterPlayer);
// 			var fp = Session.get('filterPerson');
// 			var filterQuery;

// 			if( fp === "Alle wedstrijden" || fp === undefined){
// 				// return Matches.find({}, {sort: {date: -1}});
// 				filterQuery = {}, {sort: {date: -1}};
// 			}	else{
// 				// return Matches.find({ $or: [{homePlayer: fp}, {awayPlayer: fp}] });
// 				filterQuery = { $or: [{homePlayer: fp}, {awayPlayer: fp}] };
// 			}

// 			Pages.set({
// 				filters: filterQuery,
// 			});
// 		}
// 	});

// 	Template.match.events({
// 		'click .delete-match': function(event){
// 			event.preventDefault();
// 			var matchObj = Matches.findOne(this._id),
// 				playerObj = Rankings.findOne({player: matchObj.winner}),
// 				oldRanking = Rankings.find({active: 'active'}).fetch();

// 			//punten optellen
// 			Meteor.call("decrementPoints", playerObj._id, matchObj.pointsToAdd);

// 			//ranking updaten
// 			updateRanking(oldRanking);

// 			//match verwijderen
// 			Meteor.call("removeMatch", this._id );
// 		}
// 	});
// }

// if (Meteor.isServer) {
// 	Meteor.startup(function(){
// 		//alert
// 	});

// 	Meteor.publish("matches", function(){
// 		return Matches.find();
// 	});

// 	Meteor.publish("rankings", function(){
// 		return Rankings.find();
// 	});
// }

// Meteor.methods({
// 	addMatch: function(homePlayer, homeScore, awayPlayer, awayScore, pointsToAdd, winner){
// 		Matches.insert({
// 			homePlayer: homePlayer,
// 			homeScore: homeScore,
// 			awayPlayer: awayPlayer,
// 			awayScore: awayScore,
// 			pointsToAdd: pointsToAdd,
// 			winner: winner,
// 			date: new Date()
// 		});
// 	},
// 	removeMatch: function(id){
// 		Matches.remove(id);
// 	},
// 	updateRanking: function(valId, newPos){
// 		Rankings.update(
// 			{_id: valId},
// 			{$set: {position: newPos}}
// 		);
// 	},
// 	incrementPoints: function(id, pointsToAdd){
// 		Rankings.update(
// 			{_id: id},
// 			{$inc: {points: pointsToAdd}}
// 		);
// 	},
// 	decrementPoints: function(id, pointsToAdd){
// 		Rankings.update(
// 			{_id: id},
// 			{$inc: {points: -pointsToAdd}}
// 		);
// 	}
// });
