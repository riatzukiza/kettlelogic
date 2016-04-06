'use strict';
function bind( o, m )
{
    return function()
    {
        return m.call(o, ...arguments);
    };
}

import { Component } from "../component.js";

export class MenuBar extends Component
{
    initialize()
    {
        super.initialize();
        return this;
    }
    get( name )
    {
        return this.find(`#${this.id}>*[name=${name}]`);
    }
    all()
    {
        return this.findAll(`#${this.id}>*`);
    }
}
MenuBar.register();

/*
    Component.create( MenuBar )()
        .add( DropDown, 'file' )
            .add( 'new'   )
            .add( 'open'  )
            .add( 'save'  )
            .add( 'close' )
            .add( 'exit'  );
            
    <menu-bar shadow=true>
        <div class="container">
            <drop-down name="file"></drop-down>
            <drop-down name="edit"></drop-down>
            <drop-down name="view"></drop-down>
        </div>
    </menu-bar>
*/