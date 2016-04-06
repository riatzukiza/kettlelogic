'use strict';
////////////////////////////////////////////////////////////////////////////////
import { bind, compose, conditional, curry, is, memoize, partial, post_partial } from '../../lib/functional.js';
import { identiy, limit, nearest, scale } from '../../lib/math.js';
////////////////////////////////////////////////////////////////////////////////
import { Component      } from "../component.js";
import { CSSComponent   } from "../csscomponent.js";
import { Corner         } from './corner.js';
import { Edge           } from './edge.js';
import { Panel          } from './panel.js';
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
export class Panels extends CSSComponent
{
    initialize({x,y,width,height,margin,snap})
    {
        super.initialize( ...arguments );
        
        this._dirty = false;
        this._snap  = null;

        this._snap  = { value : null, func : null };
        this._scale = { x : memoize(scale( width, width )), y : memoize(scale( height, height )) };
        this._limit = { x : memoize(limit(x,x+width-margin)), y : memoize(limit(y,y+height-margin)) };
        
        this._edges   = [];
        this._corners = [];
        this._panels  = [];
        this._margin  = margin||1;
        
        this.size( width, height );
        this.position(x,y);
        this.snap = snap||1;
        
        return this;
    }
    
    render()
    {
        
    }
    
    size(w,h)
    {
        let m = this._margin;
        this._scale.x = memoize(scale( (this.width ||w)-m, w-m ));
        this._scale.y = memoize(scale( (this.height||h)-m, h-m ));
        
        super.size(w,h);
        
        this._limit.x = memoize(limit( (this.x), (this.x+w) ));
        this._limit.y = memoize(limit( (this.y), (this.y+h) ));
        
        return this.event.emit( 'resize' );
    }
    
    // for scaling corner positions when set size changes
    scaleX( value )
    {
        let [limit,snap,scale] = [this._limit.x,this._snap.func,this._scale.x];
        let x = limit( snap( scale(value) ) );
        return x;
    }
    scaleY( value )
    {
        let [limit,snap,scale] = [this._limit.y,this._snap.func,this._scale.y];
        return limit( snap( scale(value) ) );
    }
    
    get snap()
    {
        return this._snap.value;
    }
    set snap(v)
    {
        this._snap.value = v;
        this._snap.func  = memoize(nearest(this.snap));
    }
    
    corner(x,y)
    {
        x = this._snap.func(x);
        y = this._snap.func(y);
        return this._corners.find( (c)=>(c.is(x,y)) ) ||
               this._corners[this._corners.push( Component.create(Corner)({parent:this,x:x,y:y}) )-1];
    }
    edge(a,b)
    {
        return this._edges.find( (e)=>(e.is(a,b)) ) ||
               this._edges[this._edges.push( Component.create(Edge)({parent:this,a:a,b:b}) )-1];
    }
    panel(a,b,c,d)
    {
        return this._panels[this._panels.push( Component.create(Panel)({parent:this,a:a,b:b,c:c,d:d}) )-1];
    }
    defaultpanel()
    {
        let m = this._margin;
        let [x,y,w,h] = [this.x,this.y,this.width-m,this.height-m];   
        let [a,b,c,d] = [this.corner(x,y),this.corner(x+w,y),this.corner(x+w,y+h),this.corner(x,y+h)];
        return this.panel(a,b,c,d);
    }
}
////////////////////////////////////////////////////////////////////////////////
Panels.register();
////////////////////////////////////////////////////////////////////////////////
//  let p = Component.create( Panels )({ x:0, y:0, margin:8, width: 800, height:800, snap: 64 });
