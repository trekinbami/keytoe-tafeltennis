Meteor.subscribe("matches");
Meteor.subscribe("rankings");

var Players = {
	fetchActivePlayers: function(){
		var playerlist = Rankings.find().fetch(),
		activePlayers = [];

		$.each(playerlist, function(index, value){
			if( value.active === "active" ){
				var player = {position: index, player: value.player};
				activePlayers.push(player);
			}
		});

		return activePlayers;
	},
	pointList: [
		{position: 1, points: 14},
		{position: 2, points: 10},
		{position: 3, points: 8},
		{position: 4, points: 6},
		{position: 5, points: 4},
		{position: 6, points: 3},
		{position: 7, points: 2}
	],
	awardPoints: function(winner, loser){
		var loserObj = Rankings.findOne({player: loser}),
			loserPosition = loserObj.position,
			pointsToAdd = 1;

		$.each(this.pointList, function(index, value){
			if( value.position === loserPosition ){
				pointsToAdd = value.points;
			}
		});

		return pointsToAdd;
	}
};

var Ranks = {
	newScores: [],
	changedPlayer: {},
	goesUp: false,
	updateRanking: function(oldRanking){
		var rankingObj = Rankings.find({active: 'active'}).fetch();

		$.each(rankingObj, function(index, value){
			if( value.points !== oldRanking[index].points){
				this.changedPlayer = {newpoints: value.points, oldposition: oldRanking[index].position};
				
				if( value.points > oldRanking[index].points){
					this.goesUp = true;
				}	
			}

			var score = {points: value.points, player: value.player};
			this.newScores.push(score);
		});

		this.newScores.sort(function(a,b){
			if (a.points < b.points){ return 1; }
	  		if (a.points > b.points){ return -1;}
	  		return 0;
		});

		$.each(this.newScores, function(index, value){
			if( value.points === this.changedPlayer.newpoints ){
				this.changedPlayer.newposition = index+1;
				return false;
			}
		});

		var topPosition;
		if( this.goesUp === true ){
			topPosition = Rankings.find({position: {$gte: changedPlayer.newposition, $lt: changedPlayer.oldposition}}).fetch();
		}	else{
			topPosition = Rankings.find({position: {$gt: changedPlayer.oldposition, $lte: changedPlayer.newposition}}).fetch();
		}

		$.each(topPosition, function(index, value){	
			var newRanking;
			if( this.goesUp === true){
				newRanking = (value.position+1);
			}	else{
				newRanking = (value.position-1);
			}

			Meteor.call("updateRanking", value._id, newRanking);
		});

		$.each(this.newScores, function(index, value){
			if( value.points === this.changedPlayer.newpoints ){
				var playerObj = Rankings.findOne({player: value.player}),
					newRanking = index+1;

				Meteor.call("updateRanking", playerObj._id, newRanking);
			}	
		});
	}
};

Template.body.helpers({
	activePlayers: function(){
		return Players.fetchActivePlayers();
	},
	ranking: function(){
		return Rankings.find({active: "active"}, {sort: {position: 1}});
	}
});


Template.registerHelper("prettifyDate", function(date) {	
	var d = date.getDate(),
		m = (date.getMonth() + 1),
		y = date.getFullYear(),
		y = date.getFullYear(),
		hrs = date.getHours(),
		min = ('0'+date.getMinutes()).slice(-2);

	return d+'-'+m+'-'+y+' '+hrs+':'+min;
});

Template.body.events({
	'click .add-match': function(event){
		event.preventDefault();

		var homePlayer = $('#playerOne option:selected').val(),
			homeScore = $('#scoreOne option:selected').val(),
			awayPlayer = $('#playerTwo option:selected').val(),
			awayScore = $('#scoreTwo option:selected').val();


		//winner bepalen
		var winner, loser;
		
		if( homeScore > awayScore ){
			winner = homePlayer;
			loser = awayPlayer;
		}	else{
			winner = awayPlayer;
			loser = homePlayer;
		}

		//punten geven
		var pointsToAdd = Players.awardPoints(winner, loser);

		Meteor.call("addMatch", homePlayer, homeScore, awayPlayer, awayScore, pointsToAdd, winner);

		//array maken met oude scores
		var oldRanking = Rankings.find({active: 'active'}).fetch();

		//winnnaar punten geven
		var playerObj = Rankings.findOne({player: winner});

		//punten tellen
		Meteor.call("incrementPoints", playerObj._id, pointsToAdd);

		//ranking updaten
		Ranks.updateRanking(oldRanking);
	},

	'change select': function(event){
		var opt_text = $(event.target).find('option:selected').text();
		$(event.target)
			.parent()
			.find('.mock-std')
			.text(opt_text);
	},

	'change .filter-player': function(event){
		var filterPlayer = $(event.target).find('option:selected').text();
		Session.set('filterPerson', filterPlayer);
		var fp = Session.get('filterPerson');
		var filterQuery;

		if( fp === "Alle wedstrijden" || fp === undefined){
			filterQuery = {}, {sort: {date: -1}};
		}	else{
			filterQuery = { $or: [{homePlayer: fp}, {awayPlayer: fp}] };
		}

		Pages.set({
			filters: filterQuery,
		});
	}
});

Template.match.events({
	'click .delete-match': function(event){
		event.preventDefault();
		var matchObj = Matches.findOne(this._id),
			playerObj = Rankings.findOne({player: matchObj.winner}),
			oldRanking = Rankings.find({active: 'active'}).fetch();

		//punten optellen
		Meteor.call("decrementPoints", playerObj._id, matchObj.pointsToAdd);

		//ranking updaten
		Ranks.updateRanking(oldRanking);

		//match verwijderen
		Meteor.call("removeMatch", this._id );
	}
});