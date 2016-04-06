'use strict';
////////////////////////////////////////////////////////////////////////////////
import { bind, compose, conditional, curry, is, partial, post_partial } from '../lib/functional.js';
import { TypeSet            } from '../lib/typeset.js';
import { List               } from '../lib/list.js';
import { DomEventEmitter    } from '../lib/event.js';
////////////////////////////////////////////////////////////////////////////////
const TAGS  = {};
const TYPES = {};
let   COUNT = 0;

class TypeIndex
{
    constructor( type )
    {
        this.type  = type;
        this.index = COUNT++;
        this.ctor  = document.registerElement(type.tag,type);
        this.count = 0;
    }
}
////////////////////////////////////////////////////////////////////////////////
export class Component extends HTMLElement 
{
    initialize({id}={})
    {
        this.id    = (id) ? id : Component.generateId( this );
        this.event = new DomEventEmitter( this );
        return this;
    }
    
    static create( type )
    {   
        let o = new (TAGS[type.tag].ctor)();
        return o.initialize ? bind( o, o.initialize ) : o;
    }
    static register() 
    {
        console.log( "register:", this.name, this.tag );
        return (TYPES[this.name] = TAGS[this.tag] = new TypeIndex( this ) );
    }
    static get tag()
    {
        return 'ui-'+this.name.split(/(?=[A-Z])/).join('-').toLowerCase();
    }
    static generateId( instance )
    {
        let tag = TAGS[instance.tag];
        return `T${tag.index}I${tag.count++}`;
        //return `${instance.tag}_${TAGS[instance.tag].count++}`;
    }
    
    static build( json, prev )
    {
        let result = null;
        
        if( is.array(json) )
            result = json.map( (x)=>( Component.build(x) ) );
        else
        {
            result = Component.create( TYPES[json.type].type )( json.options );
            if( json.children )
                Component.build( json.children ).forEach( (y)=>(result.append(y)) );
        }
        return result;
    }
    
    // UNIVERSAL ATTRIBUTES ////////////////////////////////////////////////////
    get type()      { return TAGS[this.tag].type; }
    get tag()       { return this.constructor.name; }
    get id()        { return this.getAttribute('id'); }
    set id(value)   { this.setAttribute('id',value); }
    get tooltip()   { return this.getAttribute('title'); }
    set tooltip(v)  { this.setAttribute('title',v); }
    get name()      { return this.getAttribute('name'); }
    set name(v)     { this.setAttribute('name',v); }
    get shadow()    { return this.getAttribute('shadow'); }
    set shadow(v)   { this.setAttribute('shadow',v); }
    ////////////////////////////////////////////////////////////////////////////
    
    // LIFECYCLE CALLBACKS /////////////////////////////////////////////////////
    createdCallback(){ this.created(); }
    created()
    {
        if(this.shadow)
        {
            this.root = this.createShadowRoot();
        }
        else
        {
            this.root = this;
        }

        //this.render();
    }
    attachedCallback()  { this.attached(); }
    attached()          { this.render(); }
    detachedCallback()  { this.detached(); }
    detached()          {}
    attributeChangedCallback(n,a,b) { this.attribute(n,a,b); }
    attribute(n, a, b)  {}
    ////////////////////////////////////////////////////////////////////////////
    
    render()
    {

    }
    
    // SUB-DOM MANIPULATION ////////////////////////////////////////////////////
    get empty()
    {
        return this.hasChildNodes();
    }
    clear()
    {
        let last;
        while( (last = this.lastChild) ) this.removeChild(last);
        return this;
    }
    append( el )
    {
        this.appendChild( el );
        return el;
    }
    insertAfter( el )
    {
        this.parentNode.insertBefore( el, this.nextSibling );
        return el;
    }
    insertBefore( el )
    {
        this.parentNode.insertBefore( el, this );
        return el;
    }
    find( selector )
    {
        return this.root.querySelector(selector);
    }
    findAll( selector )
    {
        return this.root.querySelectorAll(selector);
    }
    ////////////////////////////////////////////////////////////////////////////
}