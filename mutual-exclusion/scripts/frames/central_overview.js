
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

        frame.after(1, function () {
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
        })
            .after(600, function () {
                model().subtitle = '<h2>Central server (leader)</h2>'
                    + '<p>One elected process keeps a <em>queue</em> of waiting requests and the <em>token</em> that grants the critical section.</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(100, function () {
                frame.snapshot();
                model().zoom([node("L")]);
                model().subtitle = '<h2>Processes call <code>enter()</code></h2>'
                    + '<p>Send <strong>REQUEST</strong> to the leader, then wait for the <strong>TOKEN</strong>.</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(100, function () {
                frame.snapshot();
                model().zoom(null);
                model().subtitle = '<h2>Processes call <code>exit()</code></h2>'
                    + '<p>Send the <strong>TOKEN</strong> back to the leader. The leader passes it to the next waiter, or keeps it if the queue is empty.</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(100, function () {
                frame.snapshot();
                model().subtitle = '<h2>Message cost (happy path)</h2>'
                    + '<p><strong>enter:</strong> REQUEST + TOKEN (2 messages). <strong>exit:</strong> return TOKEN (1 message).</p>'
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
