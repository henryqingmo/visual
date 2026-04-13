
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
            model().layoutMode = "ra";
            model().nodeLabelVisible = true;
            model().nodes.create("p1").kind("process").mutexState("released");
            model().nodes.create("p2").kind("process").mutexState("released");
            model().nodes.create("p3").kind("process").mutexState("released");
            model().nodes.find("p1")._lamportT = 0;
            model().nodes.find("p2")._lamportT = 0;
            model().nodes.find("p3")._lamportT = 0;
            layout.invalidate();
        })
            .after(500, function () {
                model().subtitle = '<h2>Ricart–Agrawala</h2>'
                    + '<p>No central leader. To <code>enter()</code>, a process <strong>multicasts</strong> a timestamped '
                    + '<strong>Request</strong> to every other process and waits for <strong>all Replies</strong>.</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(100, function () {
                frame.snapshot();
                model().subtitle = '<h2>States</h2>'
                    + '<p><strong>Released</strong> — not in the CS. <strong>Wanted</strong> — waiting. '
                    + '<strong>Held</strong> — inside the CS.</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(100, function () {
                frame.snapshot();
                model().subtitle = '<h2>Priority</h2>'
                    + '<p>Requests are ordered by <strong>(Lamport time, process id)</strong> lexicographically. '
                    + 'Smaller tuple = higher priority. If you are <strong>Wanted</strong> and an incoming request '
                    + 'beats yours, you <strong>defer</strong> your Reply (queue it) until you <code>exit()</code>.</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(100, function () {
                frame.snapshot();
                model().subtitle = '<h2>Cost</h2>'
                    + '<p><strong>2(N−1)</strong> messages per CS entry: (N−1) Requests + (N−1) Replies. '
                    + 'Synchronization delay can be as low as <strong>one message delay</strong> after release.</p>'
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
