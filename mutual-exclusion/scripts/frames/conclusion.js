
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
                    + '<table class="table" style="max-width:820px;margin:1em auto;text-align:left;font-size:13px">'
                    + '<thead><tr><th></th><th>Central server</th><th>Ring</th><th>Ricart–Agrawala</th></tr></thead><tbody>'
                    + '<tr><td><strong>enter</strong> traffic</td><td>2 msgs</td><td>0 (wait for token)</td><td>2(N−1) (Request + Reply each)</td></tr>'
                    + '<tr><td><strong>exit</strong> traffic</td><td>1 msg</td><td>1 (pass token)</td><td>Replies to deferred requests</td></tr>'
                    + '<tr><td>Client delay</td><td>2 msg delays</td><td>0 … N−1</td><td>2(N−1) msg delays (all replies)</td></tr>'
                    + '<tr><td>Sync delay</td><td>2 msg delays</td><td>Often 1 hop</td><td>As low as 1 msg delay</td></tr>'
                    + '<tr><td>Structure</td><td>Leader + queue</td><td>Logical ring</td><td>Fully distributed</td></tr>'
                    + '<tr><td>Failure modes</td><td>Leader crash</td><td>Token loss</td><td>Any crash needs detection</td></tr>'
                    + '</tbody></table>'
                    + '<p>These algorithms assume correct processes; real deployments add timeouts, failure detection, and recovery.</p>'
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
