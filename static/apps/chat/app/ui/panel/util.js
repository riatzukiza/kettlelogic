
'use strict';
////////////////////////////////////////////////////////////////////////////////
import { bind, compose, conditional, curry, is, partial, post_partial } from '../../lib/functional.js';
import { identiy, limit, nearest, scale } from '../../lib/math.js';
////////////////////////////////////////////////////////////////////////////////

class Snap
{
    constructor( start, end )
    {
        this.start = start;
        this.end   = end;
        this.span  = end-start;
        this.divs  = [];
    }
    range( start, end )
    {
        this.start = start;
        this.end   = end;
    }
    point( {increment,percent,point}, ...rest )
    {
        if( increment )
        {
            
        }
        if( percent )
        {
            percent = percent / 100;
            for( let p=0; p<=this.end; p+=this.span*percent )
                this.divs.push(p);
        }
        if( point )
        {
            
        }
    }
}

function snap( start, end )
{
    
}