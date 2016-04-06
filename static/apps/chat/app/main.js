'use strict';

let bind = (o,m)=>(...args)=>(m.call(o,...args));

import { Component   } from "./ui/component.js";
import { MenuBar     } from "./ui/menu/bar.js";
import { DropDown    } from "./ui/menu/dropdown.js";
import { MenuItem    } from "./ui/menu/item.js";
import { ControlIcon } from "./ui/icon/icon.js";
import { Panels      } from "./ui/panel/panels.js";
import { mouse       } from "./lib/mouse.js";

const browser = require('remote').require('browser-window').getFocusedWindow();

console.log(browser);

window.minimize = ()=>
{
    browser.minimize();   
};

window.maximize = ()=>
{
    if(browser.isMaximized()) 
        browser.restore();
    else
        browser.maximize();  
};
window.close = ()=>
{
    browser.close();  
};
window.reload = ()=>
{
    browser.reload();  
};
window.devtools = ()=>
{
    browser.toggleDevTools();  
};

//const menujson = require( './menu.json' );

window.onload = () =>
{
/* 
    var bar = Component.build( menujson );
    
    bar.append( Component.create(ControlIcon)({ action:bind( window, window.close),     icon:"close"}) );
    bar.append( Component.create(ControlIcon)({ action:bind( window, window.maximize),  icon:"maximize"}) );
    bar.append( Component.create(ControlIcon)({ action:bind( window, window.minimize),  icon:"minimize"}) );
    bar.append( Component.create(ControlIcon)({ action:bind( window, window.reload),    icon:"refresh"}) );
    bar.append( Component.create(ControlIcon)({ action:bind( window, window.devtools),  icon:"tools"}) );
    
	document.body.appendChild( bar );
*/
 
    //mouse.on( 'move', (p)=>(console.log(p)) );
    //mouse.start();
    
    var p = Component.create( Panels )({ x:0, y:0, margin:8, width: 800, height:800, snap: 8 });
    document.body.appendChild( p );
    
    var d = p.defaultpanel();
    var e = d.split();
    var f = e.splitv();
    var g = f.splitv();
    
//    p._edges.forEach(
//        (e)=>{
//            console.log(e,e.first,e.last);
//            console.log(e.id,e.x,e.y,e.width,e.height);
//            
//    });

    setTimeout( ()=>(p.size(400,400)), 1000 );
    setTimeout( ()=>(p.size(800,800)), 1500 );
};

