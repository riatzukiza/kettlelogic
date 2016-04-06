"use strict";
////////////////////////////////////////////////////////////////////////////////
import { bind, compose, condal, curry, is, partial, post_partial, or } from "../../lib/functional.js";
import { mouse } from "../../lib/mouse.js";
////////////////////////////////////////////////////////////////////////////////
import { CSSComponent } from "../csscomponent.js";
import { Corner       } from "./corner.js";
import { Edge         } from "./edge.js";
import { Panel        } from "./panel.js";
import { Panels       } from "./panels.js";
////////////////////////////////////////////////////////////////////////////////

const move = {
    up      : (c)=>(c.neighbors.up.corner),
    down    : (c)=>(c.neighbors.down.corner),
    left    : (c)=>(c.neighbors.left.corner),
    right   : (c)=>(c.neighbors.right.corner)
};
const add = {
    up      : (g,c)=>{ g.push( c, c.neighbors.up.edge ); },
    down    : (g,c)=>{ g.push( c, c.neighbors.down.edge ); },
    left    : (g,c)=>{ g.push( c, c.neighbors.left.edge ); },
    right   : (g,c)=>{ g.push( c, c.neighbors.right.edge ); },
};
    
export class Graph
{
    constructor( origin )
    {
        this.origin = origin;
        
        this.corners = [];
        this.edges   = [];
        
        this.built = false;
        this.callback = 
        {
            enter      : this._enter.bind(this),
            exit       : this._exit.bind(this),
            drag_start : this._drag_start.bind(this),
            drag_end   : this._drag_end.bind(this),
            drag       : this._drag.bind(this)
        };
    }
    ////////////////////////////////////////////////////////////////////////////
    get corner()
    {
        switch( this.origin.type )
        {
            case Corner : return this.origin;
            case Edge   : return this.origin.first;
            case Panel  : return this.origin.corners.a;
        }
        return null;
    }
    build()
    {
        this.corners = [];
        this.edges   = [];
        switch( this.origin.type )
        {
            case Corner : 
                this.push( this.origin );
                this.search_from_corner(this.origin); 
                break;
            case Edge   : 
                this.push( this.origin );
                this.search_from_edge(this.origin);
                break;
            case Panel  : 
                //this.search_panel_perimeter(this.origin);
                break;
        }
        this.built = true;
        return this;
    }
    ////////////////////////////////////////////////////////////////////////////
    mark(prop)
    {
        if( !this.built ) this.build();
        this.corners.forEach((e)=>(e.setAttribute(prop,"")));
        this.edges.forEach((e)=>(e.setAttribute(prop,"")));
        
    }
    unmark(prop)
    {
        this.corners.forEach((e)=>(e.removeAttribute(prop)));
        this.edges.forEach((e)=>(e.removeAttribute(prop)));
    }
    ////////////////////////////////////////////////////////////////////////////
    push( e, ...rest )
    {
        if( e )
            switch( e.type )
            {
                case Corner : 
                    this.corners.push( e );
                    break;
                case Edge   : 
                    this.edges.push( e );
                    break;
                case Panel  : 
                    //this.search_panel_perimeter(this.origin);
                    break;
            }
        
        if(rest.length && rest[0]) 
        {
            this.push( ...rest );
        }
    }
    
    ////////////////////////////////////////////////////////////////////////////
    setup_events()
    {
        this.origin.event.on( "mousedown",  this.callback.drag_start );
        //this.origin.event.on( "mouseup",    this.callback.drag_end );
        this.origin.event.on( "mouseenter", this.callback.enter   );
        this.origin.event.on( "mouseleave", this.callback.exit );
    }
    clear_events()
    {
        this.origin.event.clear( "mousedown",  this.callback.drag_start );
        //this.origin.event.clear( "mouseup",    this.callback.drag_end );
        this.origin.event.clear( "mouseenter", this.callback.enter   );
        this.origin.event.clear( "mouseleave", this.callback.exit );
    }
    _enter()
    {
        this.mark("active");
    }
    _exit()
    {
        this.unmark("active");
    }
    _drag_start()
    {
        this.unmark("active");
        this.mark("drag");
        this.origin.event.clear( "mouseenter", this.callback.enter );
        this.origin.event.clear( "mouseleave", this.callback.exit );
        mouse.on( "move", this.callback.drag );
        mouse.on( "up"  , this.callback.drag_end );
        mouse.start();
    }
    _drag_end()
    {
        
        this.unmark("drag");
        //this.mark("active");
        this.origin.event.on( "mouseenter", this.callback.enter   );
        this.origin.event.on( "mouseleave", this.callback.exit );
        
        mouse
            .clear( "move", this.callback.drag )
            .clear( "up"  , this.callback.drag_end )
            .stop();
    }
    get verticalMove()
    {
        let O = this.origin;
        let T = this.origin.type;
        return T === Corner || T === Edge && O.horizontal;
    }
    get horizontalMove()
    {
        let O = this.origin;
        let T = this.origin.type;
        return T === Corner || T === Edge && O.vertical;
    }
    
    _drag( p )
    {
        if( this.origin.type === Panel ) return;
        let s         = this.origin.set;
        let o         = this.corner;
        let distance  = Corner.distance;
        let S         = s._snap.func;
        let [nx,ny]   = [S(p.x),S(p.y)];
        let [ox,oy]   = [this.origin.x,this.origin.y];
        let [dx,dy]   = [nx-ox,ny-oy];
        let [U,D,L,R] = [move.up,move.down,move.left,move.right];
        let [V,H]     = [Graph.vertical_check,Graph.horizontal_check];
        

        if( nx !== ox && this.horizontalMove )
        {
            if( ((dx > 0) && (V(o,(x)=>(distance(x,R(x))) > s.snap)) ) ||
                ((dx < 0) && (V(o,(x)=>(distance(x,L(x))) > s.snap)) )    )
            { 
                Graph.vertical_apply(o,(x)=>(x.position(nx,x.y)) );
            }
        }
        if( ny !== oy && this.verticalMove )
        {
            if( ((dy > 0) && (H(o,(x)=>(distance(x,D(x))) > s.snap)) ) ||
                ((dy < 0) && (H(o,(x)=>(distance(x,U(x))) > s.snap)) )    )
            {
                Graph.horizontal_apply(o,(x)=>(x.position(x.x,ny)) );
            }
        }
    }
    
    ////////////////////////////////////////////////////////////////////////////
    search_panel_perimeter( p, func )
    {
        if( p )
        {
            Graph.apply( p.corners.a, move.right, func||partial(add.right)(this), p.corners.b );
            Graph.apply( p.corners.b, move.down , func||partial(add.down)(this) , p.corners.c );
            Graph.apply( p.corners.c, move.left , func||partial(add.left)(this) , p.corners.d );
            Graph.apply( p.corners.d, move.up   , func||partial(add.up)(this)   , p.corners.a );
        }
    }
    search_from_corner( c, func, stop=null )
    {
        if( c )
        {
            Graph.apply( c, move.up   , func||partial(add.up)(this)   , stop );
            Graph.apply( c, move.down , func||partial(add.down)(this) , stop );  
            Graph.apply( c, move.left , func||partial(add.left)(this) , stop );
            Graph.apply( c, move.right, func||partial(add.right)(this), stop );
        }
    }
    search_from_edge( e, func, stop=null )
    {
        if( e )
        {
            if( e.vertical )
            {
                Graph.apply( e.first, move.up  , func||partial(add.up)(this)  , stop);
                Graph.apply( e.last , move.down, func||partial(add.down)(this), stop );
            }
            if( e.horizontal )
            {
                Graph.apply( e.first, move.left , func||partial(add.left)(this) , stop );
                Graph.apply( e.last , move.right, func||partial(add.right)(this), stop );
            }    
        }
    }
    ////////////////////////////////////////////////////////////////////////////
    static apply( c, next, func, stop=null )
    {
        if( c && c !== stop )
        {
            func(c);
            Graph.apply( next(c), next, func, stop );
        }
    }
    static vertical_apply( c, func, su=null, sd=null )
    {
        Graph.apply( c,move.up  ,func,su );
        Graph.apply( move.down(c),move.down,func,su );
    }
    static horizontal_apply( c, func, sl=null, sr=null )
    {
        Graph.apply( c,move.left ,func,sl );
        Graph.apply( move.right(c),move.right,func,sr );
    }
    ////////////////////////////////////////////////////////////////////////////
    static check( c, next, cond, stop=null )
    {
        if( c && c !== stop )
        {
            return cond(c) && Graph.check(next(c), next, cond, stop);
        }
        return true;
    }
    static vertical_check( c, cond, su=null, sd=null )
    {
        let [u,d,l,r] = [move.up,move.down,move.left,move.right];
        return Graph.check( c,u,cond,su ) && Graph.check( d(c),d,cond,sd );
    }
    static horizontal_check( c, cond, sl=null, sr=null )
    {
        let [u,d,l,r] = [move.up,move.down,move.left,move.right];
        return Graph.check( c,l,cond,sl ) && Graph.check( r(c),r,cond,sr );
    }
    ////////////////////////////////////////////////////////////////////////////
}

////////////////////////////////////////////////////////////////////////////////