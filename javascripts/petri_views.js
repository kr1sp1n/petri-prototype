$(function(){
  window.r = Raphael("canvas", "100%", "100%");
  //for grouping things together
  var groups = [];
  var connections = [];

//set up our object for dragging
  function dragStart() {
	var g = null;
	
	if (!isNaN(this.idx)) {
		//find the set (if possible)
		var g = groups[this.idx];
	}
	if (g) {
		var i;
		//store the starting point for each item in the set
		for(i=0; i < g.items.length; i++) {
			switch (this.type) {
				case "rect":
				case "text":
					g.items[i].ox = g.items[i].attr("x");
					g.items[i].oy = g.items[i].attr("y");
				break;
				case "circle":
					g.items[i].ox = g.items[i].attr("cx");
					g.items[i].oy = g.items[i].attr("cy");
			}
		}
	}
  }

//clean up after dragging
	function dragStop() {
		var g = null;
		if (!isNaN(this.idx)) {
			//find the set (if possible)
			var g = groups[this.idx];
		}
		if (g) {
			var i;
			//remove the starting point for each of the objects
			for(i=0; i < g.items.length; i++) {
				delete(g.items[i].ox);
				delete(g.items[i].oy);
			}
		}
	}

//take care of moving the objects when dragging
	function dragMove(dx, dy) {
		if (!isNaN(this.idx)) {
			var g = groups[this.idx];
		}
		if (g) {
			var x;
			//reposition the objects relative to their start position
			for(x = 0; x < g.items.length; x++) {
				var obj = g.items[x];   //shorthand
				obj.attr({ x: obj.ox + dx, y: obj.oy + dy });
				
				//optional:  We can do a check here to see what property
				//           we should be changing.
				// i.e. (haven't fully tested this yet):
				switch (obj.type) {
					case "rect":
					case "text":
						obj.attr({ x: obj.ox + dx, y: obj.oy + dy });
					break;
					case "circle":
						obj.attr({ cx: obj.ox + dx, cy: obj.oy + dy });
					break;
				}
			}
			for (var i = connections.length; i--;) {
                r.connection(connections[i]);
            }
			r.safari();
		}
	}

  window.TransitionView = Backbone.View.extend({
    tagName: "li",
    className: "todo",
    template: _.template("<input type='checkbox' class='todo-check' /><div class='todo-content'></div><span class='todo-destroy'></span><input type='text' class='todo-input' />"),
    events: {
      "click .todo-destroy"    : "clear"
    },
    initialize: function() {
      _.bindAll(this, 'render');
      this.model.bind('change', this.render);
      this.model.view = this;
      this.group = r.set();
    },
    render: function() {
      //alert(this.model.get('outgoing').cid);
      var t = this.model.toJSON();
      var rect = r.rect(t.x, t.y, t.width, t.height).attr({
        stroke: t.stroke,
        fill: t.fill
      });
      this.group.push(
        rect,
        r.text(t.x+(t.width/2), t.y+(t.height/2), t.name).attr({
          fill: "black",
          'font-size': 20
        })
      );
      rect.idx = groups.length;
      groups.push(this.group);
      rect.drag(dragMove, dragStart, dragStop);
      //this.viz.animate({x: 20, y: 300}, 2000, "bounce");
      //$(this.el).set('html', this.template(this.model.toJSON()));
      //$(this.el).setProperty("id", "todo-"+this.model.id);
      return this;
    },

    clear: function() {
      this.model.destroy();
    }
  });

  window.PlaceView = Backbone.View.extend({
    tagName: "li",
    className: "todo",
    template: _.template("<input type='checkbox' class='todo-check' /><div class='todo-content'></div><span class='todo-destroy'></span><input type='text' class='todo-input' />"),
    events: {
      "click .todo-destroy"    : "clear"
    },
    initialize: function() {
      _.bindAll(this, 'render');
      this.model.bind('change', this.render);
      this.model.view = this;
      this.group = r.set();
    },

    render: function() {
      //alert('render transition!');
      var p = this.model.toJSON();
      var circle = r.circle(p.x, p.y, p.radius).attr({
        stroke: p.stroke,
        fill: p.fill
      });
      this.group.push(
        circle
      );
      circle.idx = groups.length;
      groups.push(this.group);
      circle.drag(dragMove, dragStart, dragStop);
      //this.viz.animate({x: 20, y: 300}, 2000, "bounce");
      //$(this.el).set('html', this.template(this.model.toJSON()));
      //$(this.el).setProperty("id", "todo-"+this.model.id);
      return this;
    },

    clear: function() {
      this.model.destroy();
    }
  });

  window.EdgeView = Backbone.View.extend({
    tagName: "li",
    className: "todo",
    template: _.template("<input type='checkbox' class='todo-check' /><div class='todo-content'></div><span class='todo-destroy'></span><input type='text' class='todo-input' />"),
    events: {
      "click .todo-destroy"    : "clear"
    },
    initialize: function() {
      _.bindAll(this, 'render');
      this.model.bind('change', this.render);
      this.model.view = this;
      this.group = r.set();
    },

    render: function() {
      connections.push(r.connection(this.model.get('start').view.group, this.model.get('end').view.group, "#ccc"));
      return this;
    },

    clear: function() {
      this.model.destroy();
    }
  });

  window.PetriNetView = Backbone.View.extend({
    tagName:  "li",
    events: {
      "click .title"  : "render"
    },
    template: _.template('<h3 class="title"><%= title %></h3>'),
    initialize: function() {
      _.bindAll(this, 'addTransition', 'addPlace', 'addEdge', 'render');
      //alert(this.model.transitions.length);
      this.model.transitions.bind('add',   this.addTransition, this);
      this.model.places.bind('add',   this.addPlace, this);
      this.model.edges.bind('add', this.addEdge, this);
      this.model.bind('change', this.render);
      this.model.view = this;
    },
    render: function() {
      //alert('render petri net');
/*
      r.text(200, 30, this.model.toJSON().title).attr({
        fill: "white",
        'font-size': 20
      });
*/
      var self = this;

      this.model.transitions.each(function(transition) {
        self.addTransition(transition);
      });

      this.model.places.each(function(place) {
        self.addPlace(place);
      });

      this.model.edges.each(function(edge){
	    self.addEdge(edge);
      });

      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
    addTransition: function(transition) {
      var view = new TransitionView({model: transition});
      view.render();
    },
    addPlace: function(place) {
      var view = new PlaceView({model: place});
      view.render();
    },
    addEdge: function(edge) {
      var view = new EdgeView({model: edge});
      view.render();
    }
  });

  window.Petrinets = new PetriNetList();
  window.currentPetrinet = null;

  window.AppView = Backbone.View.extend({
  
    el: $("petriapp"),
    statsTemplate: _.template('<% if (total) { %><span class="todo-count"><span class="number"><%= remaining %></span><span class="word"> <%= remaining == 1 ? "item" : "items" %></span> left.</span><% } %><% if (done) { %><span class="todo-clear"><a href="#">Clear <span class="number-done"><%= done %> </span>completed <span class="word-done"><%= done == 1 ? "item" : "items" %></span></a></span><% } %>'),
  
    events: {
      "click .refresh"  : "render"
    },

    initialize: function() {
      _.bindAll(this, 'addPetrinet', 'render');
      Petrinets.bind('add',   this.addPetrinet, this);
      Petrinets.bind('all',   this.render, this);
      Petrinets.fetch();

      if(Petrinets.length==0) {
        var trans = [];
        var placs = [];
        var edgs = [
          {start:'t1', end: 'p1'},
          {start:'t2', end: 'p1'}
        ];

        for(var i=0; i<10; i++) {
          trans.push({id: "t"+String(i+1), name: "t"+String(i+1), x: Math.random()*500, y: Math.random()*500});
          placs.push({id: "p"+String(i+1), name: "p"+String(i+1), x: Math.random()*500, y: Math.random()*500});
          edgs.push({id: "e"+String(i+1), name: "e"+String(i+1), start: 't'+String(i+1), end: 'p1'});
          edgs.push({id: "e"+String(i+1), name: "e"+String(i+1), start: 't3', end: 'p'+String(i+1)});
        }

        Petrinets.add({
          title: "My 1st Petri Net",
          transitions: trans,
          edges: edgs,
          places: placs
        });
      }
      currentPetrinet = Petrinets.at(0);
      //alert(currentPetrinet.transitions.at(0).view);
    },
    
    render: function() {
      //alert('render petri app');
      /*
      var done = Todos.done().length;
      this.$("#todo-stats").set("html",this.statsTemplate({
        done:       done,
        total:      Todos.length,
        remaining:  Todos.length - done
      }));
      */
    },
    
    addPetrinet: function(petrinet) {
      var view = new PetriNetView({model: petrinet});
      view.render();
    },
  
  });

  window.App = new AppView;

});