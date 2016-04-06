import {
    Component
} from "../app/ui/component.js";
import {
    MenuBar
} from "../app/ui/menu/bar.js";
import {
    DropDown
} from "../app/ui/menu/dropdown.js";
import {
    MenuItem
} from "../app/ui/menu/item.js";
import {
    ControlIcon
} from "../app/ui/icon/icon.js";
import {
    Panels
} from "../app/ui/panel/panels.js";
import {
    mouse
} from "../app/lib/mouse.js";
function getDocumentHeight() {
    return Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
    );
}
function getDocumentWidth() {
    return Math.max(
        document.body.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.clientWidth,
        document.documentElement.scrollWidth,
        document.documentElement.offsetWidth
    );
}
/*window.onload = function() {
    var panel = Component.create(Panels)({
        x: 0,
        y: 0,
        margin: 2,
        width: getDocumentWidth(),
        height: getDocumentHeight(),
        snap:8 
    });
    document.body.appendChild(panel);
    var d = panel.defaultpanel();

    d.innerHTML = `
<iframe src="/apps/keyboard" style="width:100%;height:100%;"></iframe>
`
    var e = d.splitv();
    e.innerHTML = `
    <div id="users">
    </div>
    <div id="messages-container" >
      <div id="messages"></div>
    </div>
    <input onkeyup = "sendMessage(event)" id="message-box">CONTENT</textarea>
`
}
 */
