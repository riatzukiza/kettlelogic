'use strict';
////////////////////////////////////////////////////////////////////////////////
import { bind, compose, conditional, curry, is, partial, post_partial } from '../../lib/functional.js';
////////////////////////////////////////////////////////////////////////////////
export class Neighbors
{
    constructor( parent )
    {
        this.parent = parent;
        this._u = {
            edge   : null,
            corner : null
        };
        this._d = {
            edge   : null,
            corner : null
        };
        this._l = {
            edge   : null,
            corner : null
        };
        this._r = {
            edge   : null,
            corner : null
        };
    }
    
    get up()     { return this._u; }
    get down()   { return this._d; }
    get left()   { return this._l; }
    get right()  { return this._r; }
    
    set up(new_corner)
    {
        /*let current_corner  = this.parent;
        let existing_corner = this._u.corner;
        let existing_edge   = this._u.edge;
        
        if( existing_corner ) existing_corner.neighbors._d.corner = new_corner;
        //new_corner.neighbors._u.corner      = existing_corner;
        new_corner.neighbors._d.corner      = current_corner;
        current_corner.neighbors._u.corner  = new_corner;
        
        if( existing_edge   ) existing_edge.last = new_corner;
        let edge = this.parent.set.edge( new_corner, current_corner );
        current_corner.neighbors._u.edge = edge;
        new_corner.neighbors._d.edge     = edge;
        */
        this._u.corner = new_corner;
    }
    set down(new_corner)
    {
        let current_corner  = this.parent;
        let existing_corner = this._d.corner;
        let existing_edge   = this._d.edge;
        
        if( existing_corner ) existing_corner.neighbors._u.corner = new_corner;
        //new_corner.neighbors._d.corner      = existing_corner;
        new_corner.neighbors._u.corner      = current_corner;
        current_corner.neighbors._d.corner  = new_corner;
        
        if( existing_edge   ) existing_edge.last = new_corner;
        
        let edge = this.parent.set.edge( current_corner, new_corner );
        current_corner.neighbors._d.edge = edge;
        new_corner.neighbors._u.edge     = edge;
        this._d.corner                   = new_corner;
    }
    set left(new_corner)
    {/*
        let current_corner  = this.parent;
        let existing_corner = this._l.corner;
        let existing_edge   = this._l.edge;
        
        if( existing_corner ) existing_corner.neighbors._r.corner = new_corner;
        new_corner.neighbors._l.corner      = existing_corner;
        new_corner.neighbors._r.corner      = current_corner;
        current_corner.neighbors._l.corner  = new_corner;
        
        if( existing_edge   ) existing_edge.last = new_corner;
        let edge = this.parent.set.edge( new_corner,current_corner );
        current_corner.neighbors._l.edge = edge;
        new_corner.neighbors._r.edge     = edge;*/
        this._l.corner = new_corner;
    }
    set right(new_corner)
    {
        
        let current_corner  = this.parent;
        let existing_corner = this._r.corner;
        let existing_edge   = this._r.edge;
        
        if( existing_corner ) existing_corner.neighbors._l.corner = new_corner;
       
        
        //new_corner.neighbors._r.corner      = existing_corner;
        new_corner.neighbors._l.corner      = current_corner;
        current_corner.neighbors._r.corner  = new_corner;
        
        if( existing_edge   ) existing_edge.last = new_corner;
        let edge = this.parent.set.edge( current_corner,new_corner );
        current_corner.neighbors._r.edge = edge;
        new_corner.neighbors._l.edge     = edge;
        
        this._r.corner = new_corner;
    }
    
}
////////////////////////////////////////////////////////////////////////////////