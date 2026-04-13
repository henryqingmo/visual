
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var player = frame.player(),
            layout = frame.layout(),
            model = function () { return frame.model(); },
            wait = function () {
                var self = this;
                model().controls.show(function () { player.play(); self.stop(); });
            };

        frame.after(1, function () {
            model().clear();
            model().layoutMode = "ring";
            model().nodeLabelVisible = true;
            model().ringOrder = ["p1", "p2", "p3"];
            model().tokenLocation = "p1";
            model().nodes.create("p1").kind("process").mutexState("idle");
            model().nodes.create("p2").kind("process").mutexState("idle");
            model().nodes.create("p3").kind("process").mutexState("idle");
            layout.invalidate();
        })
            .after(600, function () {
                model().subtitle = '<h2>Token ring</h2>'
                    + '<p>Processes form a virtual ring: <strong>P1 → P2 → P3 → P1</strong>. Exactly one token circulates.</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(100, function () {
                frame.snapshot();
                model().subtitle = '<h2><code>enter()</code> and <code>exit()</code></h2>'
                    + '<p>To enter, wait until the token arrives. To exit, pass the token to your ring successor.</p>'
                    + '<p>If you are not trying to enter, forward the token immediately.</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(100, function () {
                frame.snapshot();
                model().subtitle = '<h2>Trade-offs</h2>'
                    + '<p>The token keeps moving even when no one needs the CS (up to <strong>N</strong> messages per rotation), which keeps synchronization delay low once the token reaches a waiter.</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(150, function () {
                model().title = model().subtitle = "";
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
