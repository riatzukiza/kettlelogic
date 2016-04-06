'use strict';

import { Component } from "../component.js";

let template = `<i></i></div><div class="label"></div><div class="shortcut"></div>`;

export class MenuItem extends Component
{
//    initialize( callback, name, shortcut )
    initialize({action,name,icon,shortcut})
    {
        super.initialize( ...arguments );
        this.template       = template;
        this.root.innerHTML = this.template;
        
        this._icon          = this.root.querySelector('i');
        this._label         = this.root.querySelector('.label');
        this._shortcut      = this.root.querySelector('.shortcut');
        
        this._callback      = action || (()=>(console.log(this)));
        this.icon           = icon||name;
        this.name           = name;
        this.shortcut       = (shortcut || '').toUpperCase();
        
        this.addEventListener('click', this._callback );
        
        return this;
    }
    attribute(n, a, b)  
    {
        switch( n )
        {
            case 'name'     : this._label.innerHTML    = b; break;
            case 'icon'     : this._icon.setAttribute('type',b); break;
            case 'shortcut' : this._shortcut.innerHTML = b; break;
        }
    }  
    
    get icon()
    {
        return this.getAttribute('icon');
    }
    set icon(v)
    {
        this.setAttribute('icon',v);
    }
    get shortcut()
    {
        return this.getAttribute('shortcut');
    }
    set shortcut(v)
    {
        this.setAttribute('shortcut',v);
    }
}
MenuItem.register();