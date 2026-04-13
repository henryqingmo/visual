
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var player = frame.player(),
            layout = frame.layout(),
            model = function () { return frame.model(); },
            node = function (id) { return frame.model().nodes.find(id); },
            wait = function () {
                var self = this;
                model().controls.show(function () { player.play(); self.stop(); });
            };

        function resetCentral() {
            model().clear();
            model().layoutMode = "central";
            model().nodeLabelVisible = true;
            model().leaderQueue = [];
            model().tokenLocation = "L";
            model().nodes.create("L").kind("leader").mutexState("idle");
            model().nodes.create("p1").kind("process").mutexState("idle");
            model().nodes.create("p2").kind("process").mutexState("idle");
            model().nodes.create("p3").kind("process").mutexState("idle");
            layout.invalidate();
        }

        frame.after(1, function () {
            resetCentral();
        })
            .after(400, function () {
                model().subtitle = '<h2>Walkthrough</h2>'
                    + '<p>The leader starts with the token. <strong>P2</strong> requests the critical section.</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(50, function () {
                frame.snapshot();
                node("p2").mutexState("waiting");
                layout.invalidate();
                model().send("p2", "L", { type: "REQ", text: "REQUEST" }, function () {
                    layout.invalidate();
                    model().send("L", "p2", { type: "TOK", text: "TOKEN" }, function () {
                        model().tokenLocation = "p2";
                        node("p2").mutexState("critical");
                        layout.invalidate();
                    });
                });
            })
            .after(100, wait).indefinite()
            .after(50, function () {
                frame.snapshot();
                model().subtitle = '<p><strong>P1</strong> also requests while P2 is inside the critical section — the leader enqueues P1.</p>'
                    + model().controls.html();
                layout.invalidate();
                node("p1").mutexState("waiting");
                layout.invalidate();
                model().send("p1", "L", { type: "REQ", text: "REQUEST" }, function () {
                    model().leaderQueue.push("p1");
                    layout.invalidate();
                });
            })
            .after(100, wait).indefinite()
            .after(50, function () {
                frame.snapshot();
                model().subtitle = '<p><strong>P2</strong> exits: returns the token. The leader dequeues <strong>P1</strong> and forwards the token.</p>'
                    + model().controls.html();
                layout.invalidate();
                node("p2").mutexState("idle");
                layout.invalidate();
                model().send("p2", "L", { type: "RTN", text: "TOKEN" }, function () {
                    model().tokenLocation = "L";
                    layout.invalidate();
                    model().leaderQueue.shift();
                    layout.invalidate();
                    model().send("L", "p1", { type: "TOK", text: "TOKEN" }, function () {
                        model().tokenLocation = "p1";
                        node("p1").mutexState("critical");
                        layout.invalidate();
                    });
                });
            })
            .after(100, wait).indefinite()
            .after(50, function () {
                frame.snapshot();
                model().subtitle = '<p><strong>P1</strong> exits. No one is waiting, so the leader keeps the token.</p>'
                    + model().controls.html();
                layout.invalidate();
                node("p1").mutexState("idle");
                layout.invalidate();
                model().send("p1", "L", { type: "RTN", text: "TOKEN" }, function () {
                    model().tokenLocation = "L";
                    layout.invalidate();
                });
            })
            .after(100, wait).indefinite()
            .after(200, function () {
                model().subtitle = "";
                layout.invalidate();
                player.next();
            });

        frame.addEventListener("end", function () {
            model().title = model().subtitle = "";
            layout.invalidate();
        });

        player.play();
    };
});
