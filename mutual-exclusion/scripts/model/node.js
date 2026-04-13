
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, playback, tsld*/

define([], function () {
    function Node(model, id) {
        playback.DataObject.call(this, model);
        this.id = id;
        this._kind = "process";
        this._mutexState = "idle";
        this._nameVisible = true;
    }

    Node.prototype = new playback.DataObject();
    Node.prototype.constructor = Node;

    Node.prototype.kind = function (value) {
        if (arguments.length === 0) {
            return this._kind;
        }
        this._kind = value;
        return this;
    };

    Node.prototype.mutexState = function (value) {
        if (arguments.length === 0) {
            return this._mutexState;
        }
        this._mutexState = value;
        return this;
    };

    Node.prototype.value = function () {
        return "";
    };

    Node.prototype.proposalNo = function () {
        return 0;
    };

    Node.prototype.log = function () {
        return [];
    };

    Node.prototype.state = function (value) {
        if (arguments.length === 0) {
            return this._mutexState;
        }
        this._mutexState = value;
        return this;
    };

    Node.prototype.bbox = function () {
        return tsld.bbox(this.y - this.r, this.x + this.r, this.y + this.r, this.x - this.r);
    };

    Node.prototype.clone = function (model) {
        var clone = new Node(model, this.id);
        clone._kind = this._kind;
        clone._mutexState = this._mutexState;
        clone._nameVisible = this._nameVisible;
        return clone;
    };

    return Node;
});
