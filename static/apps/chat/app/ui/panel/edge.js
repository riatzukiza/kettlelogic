'use strict';
////////////////////////////////////////////////////////////////////////////////
import { bind, compose, conditional, curry, is, partial, post_partial } from '../../lib/functional.js';
////////////////////////////////////////////////////////////////////////////////
import { CSSComponent } from "../csscomponent.js";
import { Corner       } from "./corner.js";
import { Graph        } from "./graph.js";
////////////////////////////////////////////////////////////////////////////////
const ORIENT =
{
    VERTICAL   : 0,
    HORIZONTAL : 1
};
////////////////////////////////////////////////////////////////////////////////
export class Edge extends CSSComponent
{
    initialize({parent:parent,a:a,b:b})
    {
        super.initialize( ...arguments );
        this.set         = parent;
        this.graph       = new Graph(this);
        this.orientation = (a.x===b.x) ? ORIENT.VERTICAL : ORIENT.HORIZONTAL;
        this.corner      = 
        { 
            first : a,//Corner.lesserOf(a,b), 
            last  : b//Corner.greaterOf(a,b)
        };
        this.callback    = 
        {
            reposition : bind( this, this.render )
        };
        parent.append( this );
        this.addEventListener("click", ()=>(console.log(this.corner)) );
        
        //this.setup_events();
        return this;
    }
    get isExterior()
    {
        return this.corner.first.isExterior &&
               this.corner.last.isExterior;
    }
    get first()
    {
        return this.corner.first;
    }
    set first(c)
    {
        this.clear_events();
        this.corner.first = c;
        this.setup_events();
        this.render();
    }
    get last()
    {
        return this.corner.last;
    }
    set last(c)
    {
        this.clear_events();
        this.corner.last = c;
        this.setup_events();
        this.render();
    }
    
    get vertical()   { return this.orientation === ORIENT.VERTICAL;   }
    get horizontal() { return this.orientation === ORIENT.HORIZONTAL; }
    
    is(f,l)
    {
        return this.first.id === f.id && this.last.id === l.id;
    }
    
    setup_events()
    {
        this.corner.first.event.on( 'move', this.callback.reposition );
        this.corner.last.event.on(  'move', this.callback.reposition );
        return this;
    }
    clear_events()
    {
        this.corner.first.event.clear( 'move', this.callback.reposition );
        this.corner.last.event.clear(  'move', this.callback.reposition );
        return this;
    }
    attached()
    {
        super.attached();
        this.setup_events();
        this.graph.setup_events();
    }
    render()
    {
        
        let f,l,h,v;
        [f,l] = [this.corner.first,this.corner.last];
        [h,v] = [(this.horizontal?1:0),(this.vertical?1:0)];
        
        this.x      = h*f.right  + v*f.left;
        this.y      = h*f.top    + v*f.bottom;
        this.width  = h*(l.left-f.right)   + v*(this.set._margin);
        this.height = h*(this.set._margin) + v*(l.top-f.bottom);

        return this;
    }
    split()
    {
        let l = this.corner.last,
            m = this.set._margin;
            
        if( this.vertical )
        {
            this.last = this.set.corner( this.left, (this.bottom-this.top-m)*0.5 );
            return { prev:this, midpoint:this.last, next: this.set.edge( this.last, l ) };
        }
        if( this.horizontal )
        {
            this.last = this.set.corner( (this.right-this.left-m)*0.5, this.top );
            return { prev:this, midpoint:this.last, next: this.set.edge( this.last, l ) };
        }
        return { prev: this, midpoint:null, next:null };
    }
    
}
////////////////////////////////////////////////////////////////////////////////
Edge.register();