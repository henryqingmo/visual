
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback, tsld*/

define(["./node_layout", "./message_layout"], function (NodeLayout, MessageLayout) {
    function Layout(selector) {
        tsld.Layout.call(this, selector);
        this.nodes = new NodeLayout(this);
        this.messages = new MessageLayout(this);
    }

    Layout.prototype = new tsld.Layout();
    Layout.prototype.constructor = Layout;

    Layout.prototype.initialize = function () {
        tsld.Layout.prototype.initialize.call(this);
        this.messages.g(this.g.append("g"));
        this.nodes.g(this.g.append("g"));
    };

    Layout.prototype.invalidate = function () {
        var nw = NodeLayout.WIDTH,
            model = this.model();
        if (model && model.layoutMode === "ra") {
            nw = 34;
        }
        tsld.Layout.prototype.invalidate.call(this);
        this.nodes.invalidate(50 - (nw / 2), 0, nw, 100);
        this.messages.invalidate();
    };

    return Layout;
});
