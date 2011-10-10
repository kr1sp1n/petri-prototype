var Graph = Backbone.Model.extend({
	initialize: function() {
		alert('new graph');
	}
});

var Node = Backbone.Model.extend({
	defaults: {
		type: 'node'
    },
	initialize: function() {
		alert('new Node');
	},
	coordinates: function() {
		
	}
});

var Edge = Backbone.Model.extend({
	defaults: {
		type: 'edge'
    },
	initialize: function() {
		//alert('new Edge');
	}
});

var Edges = Backbone.Collection.extend({
	model: Edge
});

var Transition = Node.extend({
	// Default attributes for a transition.
    defaults: {
	  type: 'transition',
	  width: 40,
	  height: 40,
	  stroke: "black",
	  fill: "white",
	  incoming: new Edges(),
	  outgoing: new Edges()
    },

	initialize: function() {
		//alert('new transition');
	},
	fire: function() {
		alert('fire');
	}
});

var Token = Backbone.Model.extend({
	initialize: function() {
		alert('new Token');
	}
});

var Tokens = Backbone.Collection.extend({
  model: Token
});

var Place = Node.extend({
	// Default attributes for a place.
	defaults: {
	  type: 'place',
	  radius: 20,
	  stroke: "black",
	  fill: "white",
	  incoming: new Edges(),
	  outgoing: new Edges()
    },
	initialize: function() {
		this.tokens = new Tokens();
	}
});

var Transitions = Backbone.Collection.extend({
  model: Transition
});

var Places = Backbone.Collection.extend({
  model: Place
});

var PetriNet = Graph.extend({
	initialize: function(data) {
		//alert('new Petri Net '+data.transitions);
		this.transitions = new Transitions();
		this.places = new Places();
		this.edges = new Edges();
		
		var self = this;
		if(!_.isUndefined(data.transitions)) {
			_.each(data.transitions, function(transition){
				self.transitions.add(transition);
			});
		}
		if(!_.isUndefined(data.places)) {
			_.each(data.places, function(place){
				self.places.add(place);
			});
		}
		if(!_.isUndefined(data.edges)) {
			_.each(data.edges, function(edge){
				var edge_start = edge.start,
				    edge_end = edge.end;
				
				var trans_out = self.transitions.get(edge_start);
				if(!_.isUndefined(trans_out)) {
					edge.start = trans_out;
					trans_out.get('outgoing').add(edge);
				}
				
				var trans_in = self.transitions.get(edge.end);
				if(!_.isUndefined(trans_in)) {
					edge.end = trans_in;
					trans_in.get('incoming').add(edge);
				}
				
				var place_out = self.places.get(edge.start);
				if(!_.isUndefined(place_out)) {
					edge.start = place_out;
					place_out.get('outgoing').add(edge);
				}
				var place_in = self.places.get(edge.end);
				if(!_.isUndefined(place_in)) {
					edge.end = place_in;
					place_in.get('incoming').add(edge);
				}
				self.edges.add(edge);
			});
		}
	}
});

var PetriNetList = Backbone.Collection.extend({
  model: PetriNet,
  localStorage: new Store("petrinets"),
});

/*
var Mailbox = Backbone.Model.extend({

  initialize: function() {
    this.messages = new Messages;
    this.messages.url = '/mailbox/' + this.id + '/messages';
    this.messages.bind("reset", this.updateCounts);
  }

});

var Inbox = new Mailbox;

// And then, when the Inbox is opened:

Inbox.messages.fetch();
*/