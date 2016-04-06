"use strict";
////////////////////////////////////////////////////////////////////////////////
import { is      } from "./functional.js";
import { TypeSet } from "./typeset.js";
import { List    } from "./list.js";
////////////////////////////////////////////////////////////////////////////////
export class EventEmitter
{
    constructor()
    {
        this._listeners = new TypeSet( List );
    }
    on( event, callback )
    {
        this._listeners.get( event ).push( callback );
        return this;
    }
    //once( event, callback )
    //{
    //    //return this.on(event, callback, context).limit(1);
    //}
    remove( event, callback )
    {
        this._listeners.get( event ).remove( callback );
        return this;
    }
    clear( event, callback )
    {
        if( event )
            if( callback )  this.remove( event, callback );
            else            this._listeners.get( event ).clear();
        else
            this._listeners.clear();
        return this;
    }
    has( event, callback )
    {
        if( event && this._listeners.has( event ) )
            if( callback )
                return this._listeners.get( event ).has( callback );
            else
                return true;
        return false;
    }
    listeners( event )
    {
        if( event ) return this._listeners.get(event);
        return this._listeners;
    }
    emit( event, ...args )
    {
        this._listeners.get( event ).each( (f)=>(f(...args)) );
        return this;
    }
}
////////////////////////////////////////////////////////////////////////////////

const DOM_EVENTS = [
    "mouseenter", "mouseleave", "mouseover",
    "mouseout",   "mousedown",  "mouseup", 
    "click"
];
let _is_dom_event = (e)=>(DOM_EVENTS.includes(e));

////////////////////////////////////////////////////////////////////////////////
export class DomEventEmitter extends EventEmitter
{
    constructor( el )
    {
        super();
        this._events = {};
        this._el = el;
    }  
    on( event, callback )
    {
        super.on( event, callback );
        
        if( _is_dom_event(event) && !is.defined(this._events[event]) )
        {
            this._events[event] = (...args)=>(this.emit(event,...args));
            this._el.addEventListener( event, this._events[event] );
        }
        return this;
    }
    remove( event, callback )
    {
        super.remove( event, callback );
        
        if( _is_dom_event(event) && this._listeners.get(event).empty )
        {
            this._el.removeEventListener( event, this._events[event] );
            this._events[event] = undefined;
        }
        return this;
    }
}
////////////////////////////////////////////////////////////////////////////////
export function throttle(fn, threshhold, scope) 
{
    threshhold || (threshhold = 250);
    var last, deferTimer;
    return function() 
    {
        var context = scope || this;
        var now = +new Date(),
        args = arguments;
        if (last && now < last + threshhold) 
        {
            // hold on to it
            clearTimeout(deferTimer);
            deferTimer = setTimeout(function() 
            {
                last = now;
                fn.apply(context, args);
            }, threshhold);
        } 
        else 
        {
            last = now;
            fn.apply(context, args);
        }
    };
}
////////////////////////////////////////////////////////////////////////////////
export function debounce(fn, delay)
{
    var timer = null;
    return function () 
    {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function() 
        {
            fn.apply(context, args);
        }, delay);
    };
}