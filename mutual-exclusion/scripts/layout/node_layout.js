
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3*/

define([], function () {
    var RADIUS = 7,
        RADIUS_LEADER = 8,
        MIN_PX_PROCESS = 20,
        MIN_PX_LEADER = 24,
        ANGLE_RING = { 2: 90, 3: 150, 4: 225, 5: 50 };

    function NodeLayout(parent) {
        this._parent = parent;
    }

    NodeLayout.WIDTH = 28;

    NodeLayout.prototype.parent = function () {
        return this._parent;
    };

    NodeLayout.prototype.g = function (value) {
        if (arguments.length === 0) {
            return this._g;
        }
        this._g = value;
        return this;
    };

    NodeLayout.prototype.nodes = function () {
        var model = this.parent().model();
        return (model !== null ? model.nodes.toArray() : []);
    };

    /**
     * Raw model-radius → pixels (may be tiny when zoomed out); use pixelRadiusForNode for display.
     */
    NodeLayout.prototype.scaledRadiusPx = function (modelR) {
        var raw = this.parent().scales.r(modelR);
        if (typeof raw !== "number" || !isFinite(raw)) {
            return MIN_PX_PROCESS;
        }
        return Math.max(0.5, raw);
    };

    /**
     * On-screen node radius with a pixel floor so discs stay readable vs. label text.
     */
    NodeLayout.prototype.pixelRadiusForNode = function (node) {
        var floor = (node.kind && node.kind() === "leader") ? MIN_PX_LEADER : MIN_PX_PROCESS,
            raw = this.scaledRadiusPx(node.r);
        return Math.max(floor, raw);
    };

    /** Pixel gap between description lines (relative to node size). */
    NodeLayout.prototype.lineGapPxForNode = function (node) {
        var pr = this.pixelRadiusForNode(node),
            raw = this.parent().scales.size(3);
        if (typeof raw === "number" && isFinite(raw)) {
            return Math.max(10, Math.min(raw, pr * 0.32));
        }
        return Math.max(10, pr * 0.3);
    };

    /** Baseline offset for first description line below node center (SVG +y is down). */
    NodeLayout.prototype.descriptionAnchorY = function (node) {
        var pr = this.pixelRadiusForNode(node);
        return pr + Math.max(8, Math.round(pr * 0.2));
    };

    /** Center label (P1, leader, …): keep smaller than the disc. */
    NodeLayout.prototype.centerLabelFontPx = function (node) {
        var pr = this.pixelRadiusForNode(node),
            fs = this.parent().scales.font(10);
        if (typeof fs !== "number" || !isFinite(fs)) {
            fs = 14;
        }
        return Math.min(fs, Math.max(11, pr * 0.78));
    };

    /** Monospace state / queue lines under the node. */
    NodeLayout.prototype.descriptionFontPx = function (node) {
        var pr = this.pixelRadiusForNode(node),
            fs = this.parent().scales.font(6.5);
        if (typeof fs !== "number" || !isFinite(fs)) {
            fs = 11;
        }
        return Math.min(fs, Math.max(9, pr * 0.34));
    };

    NodeLayout.prototype.displayLabel = function (node) {
        if (node.kind() === "leader") {
            return "leader";
        }
        if (node.id === "p1") {
            return "P1";
        }
        if (node.id === "p2") {
            return "P2";
        }
        if (node.id === "p3") {
            return "P3";
        }
        return node.id;
    };

    NodeLayout.prototype.invalidate = function (x, y, w, h) {
        var self = this,
            model = this.parent().model(),
            nodes = this.nodes();

        this.layout(x, y, w, h);

        this.g().selectAll(".node").data(nodes, function (d) {
            return d.id;
        })
            .call(function () {
                var transform = function (d) {
                        return "translate(" + self.parent().scales.x(d.x) + "," + self.parent().scales.y(d.y) + ")";
                    },
                    fill = function (d) {
                        if (d.mutexState() === "critical") {
                            return "#1b5e20";
                        }
                        if (d.kind() === "leader") {
                            return "#1565c0";
                        }
                        return "steelblue";
                    },
                    strokeDash = function (d) {
                        return (d.mutexState() === "waiting" ? "4,3" : "");
                    };

                var g = this.enter().append("g")
                    .attr("class", "node")
                    .attr("transform", transform);
                g.append("circle")
                    .attr("class", "node-body")
                    .attr("r", 0)
                    .style("stroke", "black")
                    .style("stroke-width", 5)
                    .style("stroke-dasharray", "")
                    .style("fill", fill);
                g.append("circle")
                    .attr("class", "token-halo")
                    .attr("r", 0)
                    .style("fill", "none")
                    .style("stroke", "#fbc02d")
                    .style("stroke-width", 3)
                    .style("opacity", 0);
                g.append("text")
                    .attr("class", "node-value")
                    .attr("y", "2")
                    .attr("fill", "white")
                    .attr("dominant-baseline", "middle")
                    .attr("text-anchor", "middle");
                g.append("text")
                    .attr("class", "node-description")
                    .attr("dominant-baseline", "middle")
                    .attr("text-anchor", "middle");

                g = this;
                g.each(function (d) {
                    this.__data__.g = this;
                });
                g = g.transition().duration(500);
                g.attr("transform", transform);
                g.select("circle.node-body")
                    .attr("r", function (d) {
                        return self.pixelRadiusForNode(d);
                    })
                    .style("stroke-dasharray", strokeDash)
                    .style("stroke-width", function (d) {
                        var pr = self.pixelRadiusForNode(d);
                        return d.mutexState() === "waiting"
                            ? Math.max(2, Math.min(4, pr * 0.11))
                            : Math.max(2, Math.min(4, pr * 0.13));
                    })
                    .style("fill", fill);
                g.select("circle.token-halo")
                    .attr("r", function (d) {
                        var pr = self.pixelRadiusForNode(d);
                        return pr + Math.max(3, pr * 0.14);
                    })
                    .style("stroke-width", function (d) {
                        var pr = self.pixelRadiusForNode(d);
                        return Math.max(1.5, Math.min(3, pr * 0.1));
                    })
                    .style("opacity", function (d) {
                        var loc = model.tokenLocation;
                        if (loc === "L" && d.kind() === "leader") {
                            return 0.95;
                        }
                        if (loc === d.id) {
                            return 0.95;
                        }
                        return 0;
                    });
                g.select("text.node-value")
                    .attr("font-size", function (d) {
                        return self.centerLabelFontPx(d);
                    })
                    .text(function (d) {
                        return self.displayLabel(d);
                    });
                g.select("text.node-description")
                    .attr("font-family", "Courier New")
                    .attr("font-size", function (d) {
                        return self.descriptionFontPx(d);
                    });

                g.each(function (node) {
                    var desc = [],
                        q,
                        gap = self.lineGapPxForNode(node),
                        anchorY = self.descriptionAnchorY(node),
                        textSel,
                        tspans;
                    if (node._nameVisible) {
                        if (node.kind() === "leader") {
                            desc.push("central server");
                            q = model.leaderQueue.map(function (pid) {
                                return self.displayLabel({ id: pid, kind: function () { return "process"; } });
                            });
                            desc.push("queue: " + (q.length ? q.join(", ") : "∅"));
                        } else {
                            desc.push(node.mutexState());
                        }
                    }

                    textSel = d3.select(this).select("text.node-description")
                        .attr("y", anchorY);
                    tspans = textSel.selectAll("tspan").data(desc);
                    tspans.enter().append("tspan").attr("x", 0);
                    tspans.attr("dy", function (d, i) {
                        return i === 0 ? 0 : gap;
                    })
                        .text(function (d) {
                            return d;
                        });
                    tspans.exit().remove();
                    textSel.attr("fill-opacity", self.parent().model().nodeLabelVisible ? 1 : 0);
                });

                g = this.exit()
                    .each(function (d) {
                        this.__data__.g = null;
                    });
                g.select("text").remove();
                g.remove();
            });
    };

    NodeLayout.prototype.layout = function (x, y, w, h) {
        var i, leader, procs, angle, step, node, order, nodes,
            model = this.parent().model(),
            raw = this.nodes();

        nodes = raw.slice();
        if (model.layoutMode === "ring") {
            order = model.ringOrder;
            nodes.sort(function (a, b) {
                return order.indexOf(a.id) - order.indexOf(b.id);
            });
        }

        if (model.layoutMode === "central") {
            leader = null;
            procs = [];
            for (i = 0; i < raw.length; i += 1) {
                node = raw[i];
                if (node.kind() === "leader") {
                    leader = node;
                } else {
                    procs.push(node);
                }
            }
            procs.sort(function (a, b) {
                return a.id.localeCompare(b.id);
            });
            if (leader !== null) {
                leader.x = x + (w / 2);
                leader.y = y + (h * 0.22);
                leader.r = RADIUS_LEADER;
                leader.ypos = "top";
            }
            for (i = 0; i < procs.length; i += 1) {
                node = procs[i];
                node.x = x + (w / 2) + ((i - (procs.length - 1) / 2) * (w * 0.28));
                node.y = y + (h * 0.72);
                node.ypos = "bottom";
            }
        } else {
            angle = ANGLE_RING[nodes.length];
            if (angle === undefined) {
                angle = 0;
            }
            angle *= (Math.PI / 180);
            if (nodes.length === 1) {
                nodes[0].x = x + (w / 2);
                nodes[0].y = y + (h / 2);
                nodes[0].r = RADIUS;
            } else {
                step = (2 * Math.PI) / nodes.length;
                for (i = 0; i < nodes.length; i += 1) {
                    node = nodes[i];
                    node.x = x + (w / 2) + ((w / 2) * Math.cos(angle));
                    node.y = y + (h / 2) + ((h / 2.1) * Math.sin(angle));
                    node.xpos = (Math.cos(angle) > 0 ? "right" : "left");
                    node.ypos = (Math.sin(angle) > 0 ? "bottom" : "top");
                    angle += step;
                    node.r = RADIUS;
                }
            }
        }
    };

    return NodeLayout;
});
