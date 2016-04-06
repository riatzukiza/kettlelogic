'use strict';
////////////////////////////////////////////////////////////////////////////////
import { bind, compose, conditional, curry, is, partial, post_partial } from '../../lib/functional.js';
////////////////////////////////////////////////////////////////////////////////
import { CSSComponent } from "../csscomponent.js";
import { Neighbors    } from "./neighbors.js";
import { Graph        } from "./graph.js";
////////////////////////////////////////////////////////////////////////////////
export class Corner extends CSSComponent
{
    initialize({parent, x, y})
    {
        super.initialize( ...arguments );
        
        this.set       = parent;
        this.neighbors = new Neighbors(this);
        this.graph     = new Graph(this);
        this.callback  = 
        {
            resize : bind( this, this.render )
        };
        
        this.position( x, y );
        this.size( parent._margin, parent._margin );

        parent.append( this );
        
        this.addEventListener("click", ()=>{
            console.log(this.neighbors);
            console.log();
        } );
        
        return this;
    }
    
    position(x,y)
    {
        super.position(x,y);
        this.event.emit( 'move' );
    }
    get isExterior()
    {
        return  this.left   === this.set.left  ||
                this.right  === this.set.right ||
                this.top    === this.set.top   ||
                this.bottom === this.set.bottom;
    }
    is(x,y)
    {
        return this.x === x && this.y === y;
    }
    
    setup_events()
    {
        this.set.event.on( 'resize', this.callback.resize );
        return this;
    }
    clear_events()
    {
        this.set.event.clear( 'resize', this.callback.resize );
        return this;
    }
    
    render()
    {
        //this.position( this.set.scaleX(this.x), this.set.scaleY(this.y) );
        this.event.emit( 'move' );
    }
    attached()
    {
        super.attached();
        this.setup_events();
        this.graph.setup_events();
    }
    detached()
    {
        super.detached();
        this.clear_events();
        this.graph.clear_events();
    }
    
    
    ////////////////////////////////////////////////////////////////////////////
    static lesserOf( a,b )
    {
        //if( a.x === b.x )
        //    return a.y > b.y ? b : a;
        //if( a.y === b.y )
        //    return a.x > b.x ? b : a;
        return a;
    }
    static greaterOf( a,b )
    {
        //if( a.x === b.x )
        //    return a.y < b.y ? b : a;
        //if( a.y === b.y )
        //    return a.x < b.x ? b : a;
        return b;
    }
    static distance(a,b)
    {
        if( !a && ! b ) return NaN;
        if( !a || ! b ) return Infinity;
        if( a.x === b.x )
            return Math.abs(b.y - a.y);
        return Math.abs(b.x-a.x);
    }
    ////////////////////////////////////////////////////////////////////////////
}
////////////////////////////////////////////////////////////////////////////////
Corner.register();
////////////////////////////////////////////////////////////////////////////////