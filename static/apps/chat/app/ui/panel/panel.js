"use strict";
////////////////////////////////////////////////////////////////////////////////
import { bind, compose, conditional, curry, is, partial, post_partial } from "../../lib/functional.js";
////////////////////////////////////////////////////////////////////////////////
import { CSSComponent } from "../csscomponent.js";
import { Corner       } from "./corner.js";
import { Graph        } from "./graph.js";
////////////////////////////////////////////////////////////////////////////////
class Corners
{
    constructor(parent)
    {
        this.panel = parent;
        this._a = this._b = null;
        this._c = this._d = null;
    }
    bind({a,b,c,d})
    {
        this.top(a,b,true);
        this.right(b,c,true);
        this.bottom(c,d,true);
        this.left(a,d,true);
        return this.link();
    }
    
    render()
    {
        if(this._a) this._a.render();
        if(this._b) this._b.render();
        if(this._c) this._c.render();
        if(this._d) this._d.render();
    }
    
    get a() { return this._a; }
    get b() { return this._b; }
    get c() { return this._c; }
    get d() { return this._d; }
    
    replace( source, target )
    {
        if( source )
        {
            target.neighbors._r.corner = source.neighbors._r.corner;
            target.neighbors._l.corner = source.neighbors._l.corner;
            target.neighbors._u.corner = source.neighbors._u.corner;
            target.neighbors._d.corner = source.neighbors._d.corner;
            
            target.neighbors._r.edge = source.neighbors._r.edge;
            target.neighbors._l.edge = source.neighbors._l.edge;
            target.neighbors._u.edge = source.neighbors._u.edge;
            target.neighbors._d.edge = source.neighbors._d.edge;
        }
        return target;
    }
    
    set a(c) { this._a = this.repalce( this._a, c ); }
    set b(c) { this._b = this.repalce( this._b, c ); }
    set c(c) { this._c = this.repalce( this._c, c ); }
    set d(c) { this._d = this.repalce( this._d, c ); }
    
    top(a,b,l)
    {
        this._a = a;
        this._b = b;
        //a.neighbors._r.corner = b;
        //b.neighbors._l.corner = a;
        
        return this.link(l);
    }
    bottom(c,d,l)
    {
        this._c = c;
        this._d = d;
        //d.neighbors._r.corner = c;
        //c.neighbors._l.corner = d;
        return this.link(l);
    }
    left(a,d,l)
    {
        this._a = a;
        this._d = d;
        //a.neighbors._d.corner = d;
        //d.neighbors._u.corner  = a;
        return this.link(l);
    }
    right(b,c,l)
    {
        this._b = b;
        this._c = c;
        //b.neighbors._d.corner = c;
        //c.neighbors._u.corner = b;
        return this.link(l);
    }
    link(abort)
    {
        if( abort ) return this;
        
        let [a,b,c,d] = [this._a,this._b,this._c,this._d];
        
        [a.neighbors.right, a.neighbors.down] = [b,d];
        [b.neighbors.left,  b.neighbors.down] = [a,c];
        [c.neighbors.left,  c.neighbors.up  ] = [d,b];
        [d.neighbors.right, d.neighbors.up  ] = [c,a];

        return this;
    }
}


export class Panel extends CSSComponent
{
    initialize({parent,a,b,c,d})
    {
        super.initialize( ...arguments );
        this.set      = parent;
        this.graph = new Graph(this);
        this.corners  = new Corners(this).bind(...arguments);
        this.callback = 
        {
            resize : bind(this,this.render)
        };
        
        this.position( a.right, a.bottom );
        this.size( c.left-a.right, c.top-a.bottom );
        
        parent.append( this );
        this.addEventListener("click", ()=>(console.log(this.corners)) );
        return this;
    }
    
    setup_events()
    {
        this.event.on( "split", this.callback.resize );
        this.corners.a.event.on( "move", this.callback.resize );
        this.corners.b.event.on( "move", this.callback.resize );      
        this.corners.c.event.on( "move", this.callback.resize );
        this.corners.d.event.on( "move", this.callback.resize );
        return this;
    }
    clear_events()
    {
        this.event.clear( "split", this.callback.resize );
        this.corners.a.event.clear( "move", this.callback.resize );
        this.corners.b.event.clear( "move", this.callback.resize );      
        this.corners.c.event.clear( "move", this.callback.resize );
        this.corners.d.event.clear( "move", this.callback.resize );
        return this;
    }
    
    render()
    {
        let [a,c] = [this.corners.a,this.corners.c];
        
        this.position( a.right,a.bottom );
        this.size( c.left-a.right, c.top-a.bottom ); 
        
        return this;
    }
    attached()
    {
        super.attached();
        this.setup_events();
        this.graph.setup_events();
    }
   
    split()
    {
        let [a,b,c,d] = [this.corners.a,this.corners.b,this.corners.c,this.corners.d];
        let x         = a.right + ((this.width - this.set._margin) / 2);
        
        let ab = this.set.corner(x,a.top);
        let dc = this.set.corner(x,d.top);
        
        this.clear_events();
        this.corners.right(ab,dc);
        this.setup_events();
        
        this.event.emit("split");

        return this.set.panel(ab,b,c,dc).render();
    }
    splitv()
    {
        let [a,b,c,d] = [this.corners.a,this.corners.b,this.corners.c,this.corners.d];
        let y         = a.bottom + ((this.height - this.set._margin) / 2);
        
        let ad = this.set.corner(a.left,y);
        let bc = this.set.corner(b.left,y);
        
        this.clear_events();
        this.corners.bottom(bc,ad);
        this.setup_events();
        
        this.event.emit("split");

        return this.set.panel(ad,bc,c,d).render();
    }
    
}
////////////////////////////////////////////////////////////////////////////////
Panel.register();