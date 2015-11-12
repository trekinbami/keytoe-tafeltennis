Matches = new Mongo.Collection('matches');
Rankings = new Mongo.Collection('rankings');
Pages = new Meteor.Pagination(Matches, {  
	itemTemplate: "match",
	route: "/items/",
	router: "iron-router",
	routerTemplate: "Items",
	routerLayout: "Layout",
	divWrapper: false,
	sort: { date: -1 },
	templateName: "Items",
	availableSettings: {
		sort: true, 
		filters: true
	}
});