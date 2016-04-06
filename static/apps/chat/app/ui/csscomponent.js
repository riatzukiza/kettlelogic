'use strict';
////////////////////////////////////////////////////////////////////////////////
import { bind, compose, conditional, curry, is, partial, post_partial } from '../lib/functional.js';
import { Component } from "./component.js";
////////////////////////////////////////////////////////////////////////////////
const TAGS = {};
////////////////////////////////////////////////////////////////////////////////
function strip_unit(value)
{
    return Number(value.slice(0,-2));
}
////////////////////////////////////////////////////////////////////////////////
export class CSSComponent extends Component
{
	static createStyleSheet()
	{
		document.head.appendChild( document.createElement( 'style' ) ).type = 'text/css';
		return document.styleSheets[ document.styleSheets.length - 1 ];
	}
	static createStyleRule( el )
	{
        let i = el.stylesheet.rules.length;
		el.stylesheet.insertRule( `${el.selector}{}`, i );
        
        return el.stylesheet.rules[i];
	}

	initialize({ parent })
	{
		super.initialize( ...arguments );
		this.stylesheet = (parent && parent.stylesheet)?parent.stylesheet:CSSComponent.createStyleSheet();
		this.rule       = CSSComponent.createStyleRule( this );
		this.css        = this.rule.style;
		return this;
	}

    // CSS MULTI PROPERTIES ////////////////////////////////////////////////////
    position( x,y )
    {
        this.x = x;
        this.y = y;
		return this;
    }
    size( w,h )
    {
        this.width  = w;
        this.height = h;
		return this;
    }
    minSize(x,y)
    {
        this.minWidth  = x;
        this.minHeight = y;
		return this;
    }
    maxSize(x,y)
    {
        this.maxWidth  = x;
        this.maxHeight = y;
		return this;
    }
	////////////////////////////////////////////////////////////////////////////

	// CSS SINGLE PROEPRTIES ///////////////////////////////////////////////////
	get selector()  { return `#${this.id}`; }

	get x() 	    { return strip_unit( this.css.left ); }
    set x(v) 	    { this.css.left = v+'px'; }
  
    get y() 	    { return strip_unit( this.css.top ); }
    set y(v) 	    { this.css.top = v+'px'; }
  
    get maxWidth()  { return strip_unit(this.css.maxWidth); }
    set maxWidth(v) { this.css.maxWidth = v + 'px'; }
    
    get minWidth()  { return strip_unit(this.css.minWidth); }
    set minWidth(v) { this.css.minWidth = v + 'px'; }
  
	get width()  	{ return strip_unit( this.css.width ); }
	set width(v)  	{ this.css.width = v + 'px'; }
    
    get maxHeight() { return strip_unit(this.css.maxHeight); }
    set maxHeight(v){ this.css.maxHeight = v + 'px'; }
    
    get minHeight() { return strip_unit(this.css.minHeight); }
    set minHeight(v){ this.css.minHeight = v + 'px'; }
    
	get height()  	{ return strip_unit( this.css.height ); }
	set height(v)   { this.css.height = v + 'px'; }

	get top()  		{ return strip_unit( this.css.top ); }
	set top(v)  	{ this.css.top = v + 'px'; }

	get bottom()  	{ return strip_unit( this.css.top ) + strip_unit( this.css.height ); }
	set bottom(v) 	{ this.css.bottom = v + 'px'; }

	get left()  	{ return strip_unit( this.css.left ); }
	set left(v)  	{ this.css.left = v + 'px'; }

	get right()  	{ return strip_unit( this.css.left ) + strip_unit(this.css.width); }
	set right(v)  	{ this.css.right = v + 'px'; }
	////////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////////
}
