'use strict';
////////////////////////////////////////////////////////////////////////////////
import { bind, compose, conditional, curry, is, partial, post_partial } from './functional.js';
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
export const E       = Math.E;       // Returns Euler's number (approx. 2.718)
export const LN2     = Math.LN2;     // Returns the natural logarithm of 2 (approx. 0.693)
export const LN10    = Math.LN10;    // Returns the natural logarithm of 10 (approx. 2.302)
export const LOG2E   = Math.LOG2E;   // Returns the base-2 logarithm of E (approx. 1.442)
export const LOG10E  = Math.LOG10E;	 // Returns the base-10 logarithm of E (approx. 0.434)
export const PI      = Math.PI;      // Returns PI (approx. 3.14)
export const SQRT1_2 = Math.SQRT1_2; // Returns the square root of 1/2 (approx. 0.707)
export const SQRT2   = Math.SQRT2;	 // Returns the square root of 2 (approx. 1.414)
////////////////////////////////////////////////////////////////////////////////
export const abs     = Math.abs;     // f(x)	    Returns the absolute value of x
export const acos    = Math.acos;    // f(x)	    Returns the arccosine of x, in radians
export const asin    = Math.asin;    // f(x)	    Returns the arcsine of x, in radians
export const atan    = Math.atan;    // f(x)	    Returns the arctangent of x as a numeric value between -PI/2 and PI/2 radians
export const atan2   = Math.atan2;   // f(y,x)	Returns the arctangent of the quotient of its arguments
export const ceil    = Math.ceil;    // f(x)	    Returns x, rounded upwards to the nearest integer
export const cos     = Math.cos;     // f(x)	    Returns the cosine of x (x is in radians)
export const exp     = Math.exp;     // f(x)	    Returns the value of Ex
export const floor   = Math.floor;   // f(x)	    Returns x, rounded downwards to the nearest integer
export const log     = Math.log;     // f(x)	    Returns the natural logarithm (base E) of x
export const max     = Math.max;     // f(x,y,z,...,n)	Returns the number with the highest value
export const min     = Math.min;     // f(x,y,z,...,n)	Returns the number with the lowest value
export const pow     = Math.pow;     // f(x,y)	Returns the value of x to the power of y
export const rand    = Math.random;  // f()	    Returns a random number between 0 and 1
export const round   = Math.round;   // f(x)	    Rounds x to the nearest integer
export const sin     = Math.sin;     // f(x)     Returns the sine of x (x is in radians)
export const sqrt    = Math.sqrt;    // f(x)     Returns the square root of x
export const tan     = Math.tan;     // f(x)     Returns the tangent of an angle
////////////////////////////////////////////////////////////////////////////////
function _limit( lower,upper,value )
{
    return max( lower, min( value, upper ) );
}
// nearest multiple of increment to value;
function _nearest( increment,value )
{
    return round(value/increment)*increment;
}
function _idenity( v )
{
    return v;
}
// 1d scaling
function _scale( _old, _new, value )
{
    return value * _new / _old;
}
////////////////////////////////////////////////////////////////////////////////
export const scale   = curry( _scale );
export const idenity = _idenity;
export const limit   = curry( _limit );           // limit(0,256)(value);
export const nearest = curry( _nearest );         // nearest(32)(value);
