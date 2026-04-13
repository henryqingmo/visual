
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
            layout.invalidate();
        })
            .after(400, function () {
                model().title = '<h2>At a glance</h2>'
                    + '<table class="table" style="max-width:720px;margin:1em auto;text-align:left">'
                    + '<thead><tr><th></th><th>Central server</th><th>Ring</th></tr></thead><tbody>'
                    + '<tr><td><strong>enter</strong> traffic</td><td>2 messages (REQUEST + TOKEN)</td><td>0 messages (wait for the token)</td></tr>'
                    + '<tr><td><strong>exit</strong> traffic</td><td>1 message (return TOKEN)</td><td>1 message (pass to successor)</td></tr>'
                    + '<tr><td>Client delay</td><td>2 message delays</td><td>0 … N−1 message delays</td></tr>'
                    + '<tr><td>Sync delay</td><td>2 message delays</td><td>Often 1 hop after release</td></tr>'
                    + '<tr><td>Failure modes</td><td>Leader is a single point of failure</td><td>Lost token if a process crashes holding it</td></tr>'
                    + '</tbody></table>'
                    + '<p>Both algorithms satisfy mutual exclusion when processes behave correctly; production systems add failure detection, timeouts, and recovery.</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(100, function () {
                model().title = model().subtitle = "";
                layout.invalidate();
            });

        player.play();
    };
});
