
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

        function passToken(fromId, toId, done) {
            model().send(fromId, toId, { type: "TOK", text: "TOKEN" }, function () {
                model().tokenLocation = toId;
                layout.invalidate();
                if (done) {
                    done();
                }
            });
        }

        function resetRing() {
            model().clear();
            model().layoutMode = "ring";
            model().nodeLabelVisible = true;
            model().ringOrder = ["p1", "p2", "p3"];
            model().tokenLocation = "p1";
            model().nodes.create("p1").kind("process").mutexState("idle");
            model().nodes.create("p2").kind("process").mutexState("idle");
            model().nodes.create("p3").kind("process").mutexState("idle");
            layout.invalidate();
        }

        frame.after(1, function () {
            resetRing();
        })
            .after(400, function () {
                model().subtitle = '<h2>Idle circulation</h2>'
                    + '<p>With no waiting processes, the token travels around the ring.</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(50, function () {
                frame.snapshot();
                passToken("p1", "p2", function () {
                    passToken("p2", "p3", function () {
                        passToken("p3", "p1", function () {
                            layout.invalidate();
                        });
                    });
                });
            })
            .after(100, wait).indefinite()
            .after(50, function () {
                frame.snapshot();
                model().subtitle = '<p><strong>P2</strong> wants the critical section. It waits until the token arrives on the next lap.</p>'
                    + model().controls.html();
                layout.invalidate();
                node("p2").mutexState("waiting");
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(50, function () {
                frame.snapshot();
                passToken("p1", "p2", function () {
                    node("p2").mutexState("critical");
                    layout.invalidate();
                });
            })
            .after(100, wait).indefinite()
            .after(50, function () {
                frame.snapshot();
                model().subtitle = '<p><strong>P2</strong> exits and passes the token to <strong>P3</strong>.</p>'
                    + model().controls.html();
                layout.invalidate();
                node("p2").mutexState("idle");
                layout.invalidate();
                passToken("p2", "p3", function () {
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
