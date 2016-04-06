'use strict';
function bind( o, m )
{
    return function()
    {
        return m.call(o, ...arguments);
    };
}

import { Component } from "../component.js";

let template = `<i></i>`;

export class ControlIcon extends Component
{
    initialize( options )
    {
        super.initialize( options );
        this.root.innerHTML = template;
        
        this._icon          = this.root.querySelector('i');
        this._callback      = options.action;
        this.addEventListener('click', this._callback ); 
        this.type           = options.icon;
         
        return this;
    }
    get type()
    {
        return this.getAttribute('type');
    }
    set type(v)
    {
        this.setAttribute('type',v);
        this._icon.setAttribute('type',v);
    }
    get callback()
    {
        return this._callback;
    }
    set callback(v)
    {
        this.removeEventListener('click', this._callback );  
        this._callback = v;
        this.addEventListener('click', this._callback );  
    }
}
ControlIcon.register();