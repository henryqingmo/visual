
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, playback, tsld*/

define(["./controls", "./message", "./node"], function (Controls, Message, Node) {
    function Model() {
        playback.Model.call(this);

        this.title = "";
        this.subtitle = "";
        this.defaultNetworkLatency = Model.DEFAULT_NETWORK_LATENCY;
        this.controls = new Controls(this);
        this.nodes = new playback.Set(this, Node);
        this.messages = new playback.Set(this, Message);
        this.nodeLabelVisible = true;
        this.latencies = {};
        this.bbox = tsld.bbox(0, 100, 100, 0);
        this.domains = {
            x: [0, 100],
            y: [0, 100],
        };

        this.layoutMode = "central";
        this.leaderQueue = [];
        this.tokenLocation = null;
        this.ringOrder = ["p1", "p2", "p3"];
        this.raOrder = ["p1", "p2", "p3"];
    }

    Model.prototype = new playback.Model();
    Model.prototype.constructor = Model;

    Model.SIMULATION_RATE = (1 / 50);
    Model.DEFAULT_NETWORK_LATENCY = 20 / Model.SIMULATION_RATE;

    Model.prototype.find = function (id) {
        return this.nodes.find(id);
    };

    Model.prototype.tick = function (t) {
        this.messages.filter(function (message) {
            return (message.recvTime > t);
        });
    };

    Model.prototype.send = function (source, target, payload, callback) {
        var message,
            src = (typeof source === "string" ? source : source.id),
            tgt = (typeof target === "string" ? target : target.id),
            latency = this.latency(src, tgt);

        if (!(latency > 0)) {
            return null;
        }

        message = this.messages.create();
        message.payload = (payload !== undefined ? payload : null);
        message.source = src;
        message.target = tgt;
        message.sendTime = this.playhead();
        message.recvTime = message.sendTime + latency;

        if (callback !== undefined && callback !== null) {
            this.frame().after(latency, callback);
        }

        return message;
    };

    Model.prototype.latency = function (a, b, latency) {
        var ret,
            x = (a < b ? a : b),
            y = (a < b ? b : a),
            key = [x, y].join("|");
        if (arguments.length === 2) {
            ret = this.latencies[key];
            return (ret !== undefined ? ret : this.defaultNetworkLatency);
        }
        this.latencies[key] = latency;
        return this;
    };

    Model.prototype.zoom = function (nodes) {
        var i, bbox = null,
            MIN_SPAN = 28,
            spanX, spanY, cx, cy;

        if (nodes === null || nodes === undefined || nodes.length === 0) {
            bbox = tsld.bbox(0, 100, 100, 0);
        } else {
            bbox = nodes[0].bbox();
            for (i = 1; i < nodes.length; i += 1) {
                bbox = bbox.union(nodes[i].bbox());
            }
            spanX = bbox.right - bbox.left;
            spanY = bbox.bottom - bbox.top;
            if (spanX < MIN_SPAN) {
                cx = (bbox.left + bbox.right) / 2;
                bbox = tsld.bbox(bbox.top, cx + MIN_SPAN / 2, bbox.bottom, cx - MIN_SPAN / 2);
            }
            if (spanY < MIN_SPAN) {
                cy = (bbox.top + bbox.bottom) / 2;
                bbox = tsld.bbox(cy - MIN_SPAN / 2, bbox.right, cy + MIN_SPAN / 2, bbox.left);
            }
        }

        this.bbox = bbox;
        this.domains.x = [bbox.left, bbox.right];
        this.domains.y = [bbox.top, bbox.bottom];
    };

    Model.prototype.clear = function () {
        this.title = this.subtitle = "";
        this.nodes.removeAll();
        this.messages.removeAll();
        this.latencies = {};
        this.layoutMode = "central";
        this.leaderQueue = [];
        this.tokenLocation = null;
        this.ringOrder = ["p1", "p2", "p3"];
        this.raOrder = ["p1", "p2", "p3"];
    };

    Model.prototype.ringSuccessor = function (id) {
        var order = this.ringOrder,
            i = order.indexOf(id);
        if (i < 0) {
            return order[0];
        }
        return order[(i + 1) % order.length];
    };

    Model.prototype.clone = function () {
        var key, clone = new Model();
        clone._player = this._player;
        clone.title = this.title;
        clone.subtitle = this.subtitle;
        clone.nodes = this.nodes.clone(clone);
        clone.messages = this.messages.clone(clone);
        clone.bbox = this.bbox;
        clone.domains = {
            x: this.domains.x,
            y: this.domains.y,
        };
        clone.layoutMode = this.layoutMode;
        clone.leaderQueue = this.leaderQueue.slice();
        clone.tokenLocation = this.tokenLocation;
        clone.ringOrder = this.ringOrder.slice();
        clone.raOrder = this.raOrder.slice();
        for (key in this.latencies) {
            if (this.latencies.hasOwnProperty(key)) {
                clone.latencies[key] = this.latencies[key];
            }
        }
        return clone;
    };

    return Model;
});
