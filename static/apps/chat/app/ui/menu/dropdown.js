'use strict';
function bind( o, m )
{
    return function()
    {
        return m.call(o, ...arguments);
    };
}

import { Component } from "../component.js";

let template = '<div class="label"></div><div class="list"></div>';

export class DropDown extends Component
{
    initialize({name})
    {
        super.initialize( ...arguments );
        
        this.root.innerHTML = template;
        this.label      =  this.root.querySelector('.label');
        this.list       =  this.root.querySelector('.list');
        
        this.name = name || "";
        return this;
    }
    
    attribute(n, a, b)  
    {
        switch( n )
        {
            case 'name' : this.label.innerHTML = b; break;
        }
    }
    
    render()
    {
        
    }
    
    get( name )
    {
        return this.find(`#${this.id}>*[name=${name}]`);
    }
    all()
    {
        return this.findAll(`#${this.id}>*`);
    }
    append( el )
    {
        return this.list.appendChild( el );
    }

    add( name )
    {
        if( !this.get(name) ) 
        {
            var li = document.createElement("div");
            li.appendChild(document.createTextNode(name));
            
            this.list.appendChild(li);
            return li;
        }
        return this.get(name);
    }
}
DropDown.register();