'use strict';
////////////////////////////////////////////////////////////////////////////////
import { bind, compose, conditional, curry, is, partial, post_partial } from './functional.js';
////////////////////////////////////////////////////////////////////////////////

export class TypeSet
{
    constructor( type )
    {
        this._type  = type;
        this._items = {};
        this._size  = 0;
    }
    
    get keys()
    {
        return Object.keys(this._items);
    }
    get values()
    {
        return Object.keys(this._items).map( (x)=>(this._items[x]) );
    }
    get entries()
    {
        return Object.keys(this._items).map( (x)=>({key:x, value:this._items[x]}) );
    }
    
    clear()
    {
        this._items = {};
        this._size  = 0;
        return this;
    }
    has( key )
    {
        return is.defined( this._items[key] );
    }
    add( key, ...args )
    {
        if( !this.has( key ) ) 
        {
            this.size++;
            return (this._items[key] = new (this._type)(...args));
        }
        return this._items[key];
    }
    del( key )
    {
        if( this.has( key ) ) 
        {
            let item = this._items[key];
            delete this._items[key];
            this.size--;
            return item;
        }
        return false;
    }
    get( key )
    {
        if( this.has( key ) ) return this._items[key];
        return this.add( key );
    }
    
    each( func )
    {
        Object.keys(this._items).forEach( (x)=>(func(x)) );
        return this;
    }
    
}