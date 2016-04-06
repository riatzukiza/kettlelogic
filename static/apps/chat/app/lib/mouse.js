"use strict";
import { EventEmitter, throttle } from "./event.js";

export class Mouse extends EventEmitter
{
    constructor( interval=250 )
    {
        super();
        this._x = 0;
        this._y = 0;
        this._interval = interval;
        this._watchers = 0;
        this._timer    = null;
        this._callback = 
        {
            pos  : this._position.bind( this ),
            move : this._move.bind(this),
            up   : this._up.bind( this ),
            down : this._down.bind( this )
        };
        
    }
    get tracking()
    {
        return this._watchers > 0;
    }
    start()
    {
        if( !this.tracking )
        {
            document.addEventListener( "mousedown", this._callback.down );
            document.addEventListener( "mouseup"  , this._callback.up );
            document.addEventListener( "mousemove", this._callback.pos );
            this._timer = setInterval( this._callback.move, this._interval );
            this.emit( "start" );
        }
        this._watchers += 1;
        return this;
    }
    stop()
    {
        this._watchers -= 1;
        if( !this.tracking )
        {
            document.removeEventListener( "mousedown", this._callback.down );
            document.removeEventListener( "mouseup"  , this._callback.up );
            document.removeEventListener( "mousemove", this._callback.pos );
            if( this._timer ) clearInterval( this._timer );
            this.emit( "stop" );
        }
        return this;
    }
    _position( e )
    {
        if( e ) [this._x,this._y] = [e.clientX, e.clientY];
    }
    _move( e )
    {
        this.emit( "move", { x:this._x, y:this._y } );
    }
    _up( e )
    {
        this.emit( "up" );
    }
    _down( e )
    {
        this._position( e );
        this.emit( "down" );
    }
}
export const mouse = new Mouse( 100 );