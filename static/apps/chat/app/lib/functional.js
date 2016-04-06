"use strict";
////////////////////////////////////////////////////////////////////////////////
export function same()
{
    return (arguments.length > 0) ? ![...arguments].some( (v,i,a)=>{return v !== a[0];} ) : false;
}
////////////////////////////////////////////////////////////////////////////////
export function memoize( fn, cache={} )
{
    return function memoize_call( param )
    {
        let key = JSON.stringify(param);
        return (cache[key]) ? cache[key] : cache[key] = fn(param);
    };
}
////////////////////////////////////////////////////////////////////////////////
export function curry(f)
{
	let a = [...arguments];
	if( a.length >= f.length+1 ) return f( ...a.slice(1) );
	return function curry_call() 
	{
		return curry( ...a, ...arguments );
	};
}
////////////////////////////////////////////////////////////////////////////////
export function bind( object, method )
{
    return function bind_call()
    {
        return method.call(object,...arguments);
    };
}
//bind(obj,obj.func)(...p) === obj.func(...p)
////////////////////////////////////////////////////////////////////////////////
export function partial( f )
{
    return function partial_args()
    {
        let a = arguments;
        return function partial_call()
        {
            return f(...a,...arguments);
        };
    };
}
// partial(func)(...pa)(...pb) === func(...pa,...pb)
////////////////////////////////////////////////////////////////////////////////
export function post_partial( f )
{
    return function post_partial_args( f )
    {
        let a = arguments;
        return function post_partial_call()
        {
            return f(...arguments,...a);
        };
    };
}
// post_partial(func)(...pa)(...pb) === func(...pb,...pa)
////////////////////////////////////////////////////////////////////////////////
function conditional_application(cond, f, x)
{
	return cond(x) ? f(x) : x;
}
////////////////////////////////////////////////////////////////////////////////
export function compose(a,b)
{
	return (c)=>(a(b(c)));
}
////////////////////////////////////////////////////////////////////////////////
export function is_type(type, x)
{
	return ((typeof x) === type);
}
////////////////////////////////////////////////////////////////////////////////
function is_instance_of(proto, x)
{
	return (x instanceof proto);
}
////////////////////////////////////////////////////////////////////////////////
function defined(v)
{
	return (v!==undefined);
}
////////////////////////////////////////////////////////////////////////////////
function is_array(a)
{
    return Array.isArray( a );
}
////////////////////////////////////////////////////////////////////////////////
function is_truthy(v)
{ 
    return v===true || v>0 || defined(v);
}
////////////////////////////////////////////////////////////////////////////////
function is_false(v)
{
    return v===false || v===null || v===undefined || v===0;
}
////////////////////////////////////////////////////////////////////////////////
export function or( cond, a, b )
{
    return cond ? a : b;
}
export const conditional 	= curry(conditional_application);
////////////////////////////////////////////////////////////////////////////////
export const is = {
    'boolean' 	: curry(is_type,'boolean'),
    'function'	: curry(is_type,'function'),
    'number' 	: curry(is_type,'number'),
    'object'	: curry(is_type,'object'),
    'string' 	: curry(is_type,'string'),
    'symbol' 	: curry(is_type,'symbol'),
    'array'     : is_array,
    'truthy'    : is_truthy,
    'falsey'    : is_false,
    'undefined' : curry(is_type,'undefined'),
    'defined'   : defined,
    'instance' 	: curry(is_instance_of)
};
////////////////////////////////////////////////////////////////////////////////
//import { bind, compose, conditional, curry, is, partial, post_partial } from '../lib/functional.js';

